package com.facilitalab.service;

import com.facilitalab.exception.TransicaoInvalidaException;
import com.facilitalab.models.EstadoEnum;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class EstadoTransicaoValidator {

    private static final Map<EstadoEnum, Set<EstadoEnum>> TRANSICOES = Map.of(
        EstadoEnum.AGUARDANDO_TRIAGEM, Set.of(
            EstadoEnum.AGUARDANDO_INFORMACOES,
            EstadoEnum.EM_ANALISE,
            EstadoEnum.CANCELADO
        ),
        EstadoEnum.AGUARDANDO_INFORMACOES, Set.of(
            EstadoEnum.AGUARDANDO_TRIAGEM,
            EstadoEnum.CANCELADO
        ),
        EstadoEnum.EM_ANALISE, Set.of(
            EstadoEnum.EM_MODELAGEM,
            EstadoEnum.CANCELADO
        ),
        EstadoEnum.EM_MODELAGEM, Set.of(
            EstadoEnum.AGUARDANDO_APROVACAO_DESIGN,
            EstadoEnum.CANCELADO
        ),
        EstadoEnum.AGUARDANDO_APROVACAO_DESIGN, Set.of(
            EstadoEnum.EM_CORRECAO,
            EstadoEnum.USINAGEM,
            EstadoEnum.CANCELADO
        ),
        EstadoEnum.EM_CORRECAO, Set.of(
            EstadoEnum.AGUARDANDO_APROVACAO_DESIGN,
            EstadoEnum.CANCELADO
        ),
        EstadoEnum.USINAGEM, Set.of(
            EstadoEnum.FINALIZADO,
            EstadoEnum.CANCELADO
        ),
        EstadoEnum.FINALIZADO, Set.of(),
        EstadoEnum.CANCELADO, Set.of()
    );

    public void validar(EstadoEnum estadoAtual, EstadoEnum novoEstado) {
        Set<EstadoEnum> permitidos = TRANSICOES.getOrDefault(estadoAtual, Set.of());
        if (!permitidos.contains(novoEstado)) {
            throw new TransicaoInvalidaException(estadoAtual.name(), novoEstado.name());
        }
    }
}