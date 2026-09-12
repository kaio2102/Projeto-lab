package com.facilitalab.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.facilitalab.models.EstadoEnum;
import com.facilitalab.models.MaterialEnum;
import com.facilitalab.models.PrioridadeEnum;
import com.facilitalab.models.TipoProteseEnum;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class PedidoSaidaDTO {

    private Long id;

    private String cor;

    private MaterialEnum material;

    private EstadoEnum estado;

    private Long dentistaId;

    private String nomeDentista;

    private String nomeCadista;
    
    private PrioridadeEnum prioridade;

    private String observacoes;

    private TipoProteseEnum tipoProtese;

    private LocalDate prazoEntrega;

    private LocalDateTime dataCriacao;

    private LocalDateTime dataAtualizacao;
}
