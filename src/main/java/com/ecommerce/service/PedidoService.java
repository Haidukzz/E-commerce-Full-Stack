package com.ecommerce.service;

import com.ecommerce.dto.request.PedidoRequest;
import com.ecommerce.dto.response.PedidoResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.*;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final CupomRepository cupomRepository;
    private final EnderecoRepository enderecoRepository;
    private final UsuarioService usuarioService;

    @Value("${app.business.order.approval-threshold:200.00}")
    private BigDecimal limiteAprovacao;

    @Value("${app.business.order.max-items:50}")
    private int maxItens;

    // ── Criação ───────────────────────────────────────────────────────────────

    @Transactional
    public PedidoResponse criar(PedidoRequest request) {
        Usuario usuario = usuarioService.usuarioAtual();

        if (request.getItens().size() > maxItens) {
            throw new RegraDeNegocioException("Pedido não pode ter mais de " + maxItens + " itens");
        }

        Pedido pedido = Pedido.builder().usuario(usuario).build();

        // Monta itens + reserva estoque
        List<ItemPedido> itens = new ArrayList<>();
        for (PedidoRequest.ItemPedidoRequest itemReq : request.getItens()) {
            Produto produto = produtoRepository.findById(itemReq.getProdutoId())
                .filter(Produto::getAtivo)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", itemReq.getProdutoId()));

            if (!produto.temEstoque(itemReq.getQuantidade())) {
                throw new EstoqueInsuficienteException(produto.getNome());
            }

            produto.decrementarEstoque(itemReq.getQuantidade());
            produtoRepository.save(produto);

            ItemPedido item = ItemPedido.builder()
                .pedido(pedido)
                .produto(produto)
                .quantidade(itemReq.getQuantidade())
                .precoUnitario(produto.getPreco())
                .subtotal(produto.getPreco().multiply(BigDecimal.valueOf(itemReq.getQuantidade())))
                .build();
            itens.add(item);
        }
        pedido.setItens(itens);

        // Endereço de entrega
        if (request.getEnderecoEntregaId() != null) {
            Endereco end = enderecoRepository.findById(request.getEnderecoEntregaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Endereço", request.getEnderecoEntregaId()));
            if (!end.getUsuario().getId().equals(usuario.getId())) {
                throw new AcessoNegadoException();
            }
            pedido.setEnderecoEntrega(end);
        }

        // Cupom de desconto
        if (request.getCodigoCupom() != null && !request.getCodigoCupom().isBlank()) {
            Cupom cupom = cupomRepository.findByCodigo(request.getCodigoCupom())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Cupom não encontrado: " + request.getCodigoCupom()));

            pedido.calcularTotais(); // subtotal necessário para validar cupom
            if (!cupom.isValido(pedido.getSubtotal())) {
                throw new RegraDeNegocioException("Cupom inválido ou expirado: " + request.getCodigoCupom());
            }
            pedido.setCupom(cupom);
            cupom.registrarUso();
            cupomRepository.save(cupom);
        }

        pedido.setObservacoes(request.getObservacoes());
        pedido.calcularTotais();

        // Regra: pedidos acima do limite ficam aguardando aprovação de gerente
        if (pedido.getTotal().compareTo(limiteAprovacao) > 0) {
            pedido.setStatus(StatusPedido.AGUARDANDO_PAGAMENTO);
            log.info("Pedido acima do limite de aprovação ({}): total={}", limiteAprovacao, pedido.getTotal());
        }

        Pedido salvo = pedidoRepository.save(pedido);
        registrarHistorico(salvo, null, StatusPedido.PENDENTE, "Pedido criado", usuario.getEmail());

        log.info("Pedido criado: id={}, usuario={}, total={}", salvo.getId(), usuario.getEmail(), salvo.getTotal());
        return PedidoResponse.from(salvo);
    }

    // ── Consultas ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PedidoResponse> listarMeusPedidos(Pageable pageable) {
        Usuario usuario = usuarioService.usuarioAtual();
        return pedidoRepository.findByUsuarioId(usuario.getId(), pageable).map(PedidoResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<PedidoResponse> listarTodos(Long usuarioId, StatusPedido status, Pageable pageable) {
        return pedidoRepository.buscar(usuarioId, status, pageable).map(PedidoResponse::from);
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscarPorId(Long id) {
        Pedido pedido = encontrarPorId(id);
        Usuario atual = usuarioService.usuarioAtual();
        boolean isAdmin = atual.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        if (!isAdmin && !pedido.pertenceAo(atual.getId())) {
            throw new AcessoNegadoException();
        }
        return PedidoResponse.from(pedido);
    }

    // ── Atualização de status ─────────────────────────────────────────────────

    @Transactional
    public PedidoResponse atualizarStatus(Long id, StatusPedido novoStatus, String observacao) {
        Pedido pedido = encontrarPorId(id);
        StatusPedido statusAtual = pedido.getStatus();

        if (!statusAtual.podeTransicionarPara(novoStatus)) {
            throw new RegraDeNegocioException(
                String.format("Transição inválida: %s → %s", statusAtual, novoStatus));
        }

        // Se cancelado, devolve estoque
        if (novoStatus == StatusPedido.CANCELADO) {
            devolverEstoque(pedido);
        }

        pedido.setStatus(novoStatus);
        Pedido salvo = pedidoRepository.save(pedido);

        String executor = usuarioService.usuarioAtual().getEmail();
        registrarHistorico(salvo, statusAtual, novoStatus, observacao, executor);
        log.info("Status do pedido {} alterado: {} → {}", id, statusAtual, novoStatus);

        return PedidoResponse.from(salvo);
    }

    @Transactional
    public PedidoResponse cancelar(Long id) {
        Pedido pedido = encontrarPorId(id);
        Usuario atual = usuarioService.usuarioAtual();
        boolean isAdmin = atual.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"));
        if (!isAdmin && !pedido.pertenceAo(atual.getId())) {
            throw new AcessoNegadoException();
        }
        return atualizarStatus(id, StatusPedido.CANCELADO, "Cancelado pelo usuário");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void devolverEstoque(Pedido pedido) {
        for (ItemPedido item : pedido.getItens()) {
            Produto produto = item.getProduto();
            produto.incrementarEstoque(item.getQuantidade());
            produtoRepository.save(produto);
            log.info("Estoque devolvido: produto={}, qtd={}", produto.getId(), item.getQuantidade());
        }
    }

    private void registrarHistorico(Pedido pedido, StatusPedido anterior,
                                    StatusPedido novo, String obs, String executor) {
        HistoricoPedido hist = HistoricoPedido.builder()
            .pedido(pedido)
            .statusAnterior(anterior != null ? anterior.name() : null)
            .statusNovo(novo.name())
            .observacao(obs)
            .alteradoPor(executor)
            .build();
        pedido.getHistorico().add(hist);
    }

    public Pedido encontrarPorId(Long id) {
        return pedidoRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Pedido", id));
    }
}
