package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoriaRequest {
    @NotBlank @Size(max = 100)
    private String nome;
    private String descricao;
}
