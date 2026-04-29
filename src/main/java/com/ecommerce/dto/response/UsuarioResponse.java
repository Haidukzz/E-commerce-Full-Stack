package com.ecommerce.dto.response;

import com.ecommerce.entity.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Builder
public class UsuarioResponse {
    private Long id;
    private String nome;
    private String email;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private List<String> perfis;

    public static UsuarioResponse from(Usuario u) {
        return UsuarioResponse.builder()
            .id(u.getId()).nome(u.getNome()).email(u.getEmail())
            .ativo(u.getAtivo()).dataCriacao(u.getDataCriacao())
            .perfis(u.getPerfis().stream().map(Perfil::getNome).collect(Collectors.toList()))
            .build();
    }
}
