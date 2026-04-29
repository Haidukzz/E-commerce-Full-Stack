package com.ecommerce.dto.response;

import com.ecommerce.entity.Categoria;
import lombok.*;

@Getter @Builder
public class CategoriaResponse {
    private Long id;
    private String nome;
    private String descricao;
    private Boolean ativa;

    public static CategoriaResponse from(Categoria c) {
        return CategoriaResponse.builder()
            .id(c.getId()).nome(c.getNome()).descricao(c.getDescricao()).ativa(c.getAtiva())
            .build();
    }
}
