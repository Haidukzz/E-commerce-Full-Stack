package com.ecommerce.service;

import com.ecommerce.dto.response.ProdutoResponse;
import com.ecommerce.entity.StatusPedido;
import com.ecommerce.repository.*;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;

    @Getter @Builder
    public static class DashboardResponse {
        private long totalPedidos;
        private long pedidosPendentes;
        private long pedidosPagos;
        private long pedidosEntregues;
        private long pedidosCancelados;
        private BigDecimal receitaTotal;
        private long totalProdutos;
        private long produtosEstoqueBaixo;
        private long totalUsuarios;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        return DashboardResponse.builder()
            .totalPedidos(pedidoRepository.count())
            .pedidosPendentes(pedidoRepository.contarPorStatus(StatusPedido.PENDENTE))
            .pedidosPagos(pedidoRepository.contarPorStatus(StatusPedido.PAGO))
            .pedidosEntregues(pedidoRepository.contarPorStatus(StatusPedido.ENTREGUE))
            .pedidosCancelados(pedidoRepository.contarPorStatus(StatusPedido.CANCELADO))
            .receitaTotal(pedidoRepository.somarVendasEntregues().orElse(BigDecimal.ZERO))
            .totalProdutos(produtoRepository.count())
            .produtosEstoqueBaixo(produtoRepository.findProdutosComEstoqueBaixo().size())
            .totalUsuarios(usuarioRepository.count())
            .build();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> produtosEstoqueBaixo() {
        return produtoRepository.findProdutosComEstoqueBaixo()
            .stream().map(ProdutoResponse::from).toList();
    }
}
