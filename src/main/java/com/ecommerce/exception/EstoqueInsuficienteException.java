package com.ecommerce.exception;

import org.springframework.http.HttpStatus;

public class EstoqueInsuficienteException extends ApiException {
    public EstoqueInsuficienteException(String produto) {
        super("Estoque insuficiente para o produto: " + produto, HttpStatus.CONFLICT);
    }
}
