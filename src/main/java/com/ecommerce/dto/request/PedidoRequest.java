package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PedidoRequest {

    @NotEmpty(message = "Pedido deve ter pelo menos um item")
    private List<ItemPedidoRequest> itens;

    private Long enderecoEntregaId;
    private String codigoCupom;
    private String observacoes;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemPedidoRequest {
        @NotNull(message = "Produto é obrigatório")
        private Long produtoId;

        @NotNull @Min(value = 1, message = "Quantidade mínima é 1")
        private Integer quantidade;
    }
}
