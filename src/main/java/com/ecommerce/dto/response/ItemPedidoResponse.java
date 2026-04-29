package com.ecommerce.dto.response;

import com.ecommerce.entity.ItemPedido;
import lombok.*;
import java.math.BigDecimal;

@Getter @Builder
public class ItemPedidoResponse {
    private Long id;
    private Long produtoId;
    private String produto;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private BigDecimal subtotal;

    public static ItemPedidoResponse from(ItemPedido i) {
        return ItemPedidoResponse.builder()
            .id(i.getId()).produtoId(i.getProduto().getId())
            .produto(i.getProduto().getNome()).quantidade(i.getQuantidade())
            .precoUnitario(i.getPrecoUnitario()).subtotal(i.getSubtotal())
            .build();
    }
}
