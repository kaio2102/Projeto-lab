package com.facilitalab.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class UsuarioSaidaDTO {

    private Long id;
    private String nome;
    private String email;
    private String perfil;
    private LocalDateTime dataCriacao;
    private String cpf;
    private String telefone;
    // Exclusivo de dentista
    private String cro;
}
