package com.facilitalab.exception;

public class AcessoNegadoException extends RuntimeException {
    public AcessoNegadoException() {
        super("Acesso negado: você não tem permissão para acessar este recurso");
    }
}