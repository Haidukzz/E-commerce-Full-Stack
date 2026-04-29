package com.ecommerce.exception;

import org.springframework.http.HttpStatus;

public class RecursoNaoEncontradoException extends ApiException {
    public RecursoNaoEncontradoException(String recurso, Object id) {
        super(recurso + " não encontrado(a) com id: " + id, HttpStatus.NOT_FOUND);
    }
    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem, HttpStatus.NOT_FOUND);
    }
}
