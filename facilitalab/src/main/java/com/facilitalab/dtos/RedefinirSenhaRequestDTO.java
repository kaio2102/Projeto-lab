package com.facilitalab.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RedefinirSenhaRequestDTO {
 
    @NotBlank(message = "Token é obrigatório.")
    private String token;
    @NotBlank(message = "Nova senha é obrigatória.")
    private String novaSenha;

 
}
