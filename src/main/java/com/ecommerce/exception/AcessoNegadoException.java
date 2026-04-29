package com.ecommerce.exception;

import org.springframework.http.HttpStatus;

public class AcessoNegadoException extends ApiException {
    public AcessoNegadoException() {
        super("Acesso negado a este recurso", HttpStatus.FORBIDDEN);
    }
}
