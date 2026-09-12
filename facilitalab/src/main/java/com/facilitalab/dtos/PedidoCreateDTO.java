package com.facilitalab.dtos;

import java.time.LocalDate;

import com.facilitalab.models.MaterialEnum;
import com.facilitalab.models.PrioridadeEnum;
import com.facilitalab.models.TipoProteseEnum;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class PedidoCreateDTO {

@NotBlank(message = "A cor é obrigatória")
@Size(max = 50, message = "A cor deve ter no máximo 50 caracteres")   
private String cor;

@NotNull(message = "O tipo de prótese é obrigatório")
private TipoProteseEnum tipoProtese;

@NotNull(message = "O material é obrigatório")
private MaterialEnum material;

@NotNull(message = "A prioridade é obrigatória")
private PrioridadeEnum prioridade;

@Size(max = 500, message = "As observações devem ter no máximo 500 caracteres")
private String observacoes;

@NotNull(message = "O prazo de entrega é obrigatório")
@Future(message = "O prazo deve ser uma data futura")
private LocalDate prazoEntrega;

@NotNull(message = "O ID do dentista é obrigatório")
private Long dentistaId;

private Long cadistaId;

}
