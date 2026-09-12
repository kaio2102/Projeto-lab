package com.facilitalab.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDTO {

    private Long id;
    private String token;
    private String nome;
    private String perfil;
}