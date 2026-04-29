package com.ecommerce.exception;

import org.springframework.http.HttpStatus;

public class RegraDeNegocioException extends ApiException {
    public RegraDeNegocioException(String mensagem) {
        super(mensagem, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
