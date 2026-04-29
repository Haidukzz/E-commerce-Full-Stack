package com.ecommerce.dto.response;

import com.ecommerce.entity.Produto;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProdutoResponse {

    private Long id;
    private String nome;
    private String descricao;
    private String sku;
    private BigDecimal preco;
    private Integer estoque;
    private Integer estoqueMinimo;
    private boolean estoqueAbaixoMinimo;
    private String categoria;
    private Long categoriaId;
    private Boolean ativo;
    private LocalDateTime dataCriacao;

    public static ProdutoResponse from(Produto p) {
        return ProdutoResponse.builder()
            .id(p.getId())
            .nome(p.getNome())
            .descricao(p.getDescricao())
            .sku(p.getSku())
            .preco(p.getPreco())
            .estoque(p.getEstoque())
            .estoqueMinimo(p.getEstoqueMinimo())
            .estoqueAbaixoMinimo(p.estoqueAbaixoMinimo())
            .categoria(p.getCategoria().getNome())
            .categoriaId(p.getCategoria().getId())
            .ativo(p.getAtivo())
            .dataCriacao(p.getDataCriacao())
            .build();
    }
}
