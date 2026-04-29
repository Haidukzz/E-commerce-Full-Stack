package com.ecommerce.dto.response;

import com.ecommerce.entity.Pedido;
import com.ecommerce.dto.response.ItemPedidoResponse;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Builder
public class PedidoResponse {
    private Long id;
    private Long usuarioId;
    private String usuario;
    private LocalDateTime dataPedido;
    private BigDecimal subtotal;
    private BigDecimal desconto;
    private BigDecimal total;
    private String status;
    private List<ItemPedidoResponse> itens;
    private String observacoes;

    public static PedidoResponse from(Pedido p) {
        return PedidoResponse.builder()
            .id(p.getId()).usuarioId(p.getUsuario().getId()).usuario(p.getUsuario().getNome())
            .dataPedido(p.getDataPedido()).subtotal(p.getSubtotal())
            .desconto(p.getDesconto()).total(p.getTotal()).status(p.getStatus().name())
            .itens(p.getItens().stream().map(ItemPedidoResponse::from).collect(Collectors.toList()))
            .observacoes(p.getObservacoes())
            .build();
    }
}
