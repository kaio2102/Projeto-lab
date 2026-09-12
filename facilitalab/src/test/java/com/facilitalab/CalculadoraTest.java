package com.facilitalab;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculadoraTest {

    @Test
    void deveSomarDoisNumeros() {

        // Preparação
        Calculadora calculadora = new Calculadora();

        // Execução
        int resultado = calculadora.somar(2, 3);

        // Verificação
        assertEquals(5, resultado);
    }
}