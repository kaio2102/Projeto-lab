package com.facilitalab.exception;

public class TransicaoInvalidaException extends RuntimeException {
    public TransicaoInvalidaException(String estadoAtual, String novoEstado) {
        super("Transição inválida: " + estadoAtual + " → " + novoEstado);
    }
}