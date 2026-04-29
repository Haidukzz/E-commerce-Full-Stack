package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

public final class AuthDTOs {

    @Getter @Setter
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String senha;
    }

    @Getter @Setter @Builder
    public static class RegisterRequest {
        @NotBlank @Size(min = 2, max = 100)
        private String nome;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String senha;
    }

    @Getter @Setter @AllArgsConstructor
    public static class TokenResponse {
        private String token;
        private String tipo;
        private String email;
        private String nome;
    }
}
