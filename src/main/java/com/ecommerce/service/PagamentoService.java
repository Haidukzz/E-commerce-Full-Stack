package com.ecommerce.service;

import com.ecommerce.entity.*;
import com.ecommerce.exception.*;
import com.ecommerce.repository.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final PedidoService pedidoService;

    @Getter @AllArgsConstructor
    public static class PagamentoRequest {
        private String meioPagamento; // CARTAO_CREDITO, PIX, BOLETO
        private String transacaoId;   // ID retornado pelo gateway externo
    }

    @Transactional
    public Pagamento processarPagamento(Long pedidoId, PagamentoRequest request) {
        Pedido pedido = pedidoService.encontrarPorId(pedidoId);

        if (pedido.getStatus() != StatusPedido.PENDENTE &&
            pedido.getStatus() != StatusPedido.AGUARDANDO_PAGAMENTO) {
            throw new RegraDeNegocioException("Pedido não está aguardando pagamento");
        }

        // Simula integração com gateway (em produção chamaria Stripe/PagSeguro/etc.)
        boolean aprovado = simularGateway(request.getMeioPagamento(), request.getTransacaoId());

        Pagamento pagamento = pagamentoRepository.findByPedidoId(pedidoId)
            .orElse(Pagamento.builder().pedido(pedido).build());

        if (aprovado) {
            pagamento.setStatus(Pagamento.StatusPagamento.APROVADO);
            pagamento.setMeioPagamento(request.getMeioPagamento());
            pagamento.setTransacaoId(request.getTransacaoId());
            pagamento.setValorPago(pedido.getTotal());
            pagamento.setDataPagamento(LocalDateTime.now());
            pagamento.setGatewayResposta("APROVADO");

            pagamentoRepository.save(pagamento);
            pedidoService.atualizarStatus(pedidoId, StatusPedido.PAGO, "Pagamento aprovado via " + request.getMeioPagamento());
            log.info("Pagamento aprovado: pedido={}, valor={}", pedidoId, pedido.getTotal());
        } else {
            pagamento.setStatus(Pagamento.StatusPagamento.RECUSADO);
            pagamento.setGatewayResposta("RECUSADO PELO GATEWAY");
            pagamentoRepository.save(pagamento);
            throw new RegraDeNegocioException("Pagamento recusado pelo gateway. Verifique os dados e tente novamente.");
        }

        return pagamento;
    }

    @Transactional(readOnly = true)
    public Pagamento buscarPorPedido(Long pedidoId) {
        return pagamentoRepository.findByPedidoId(pedidoId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Pagamento para o pedido", pedidoId));
    }

    /** Simula aprovação do gateway — em produção, chamar SDK do Stripe/PagSeguro */
    private boolean simularGateway(String meio, String transacaoId) {
        // Recusa transações com ID terminando em "FAIL" para fins de teste
        return transacaoId == null || !transacaoId.toUpperCase().endsWith("FAIL");
    }
}
