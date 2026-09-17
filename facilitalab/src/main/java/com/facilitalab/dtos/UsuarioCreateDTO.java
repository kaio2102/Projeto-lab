package com.facilitalab.dtos;

import com.facilitalab.models.PerfilEnum;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.br.CPF;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class UsuarioCreateDTO {

    @NotBlank(message = "Informe o nome")
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @NotBlank(message = "Informe o e-mail.")
    @Email(message = "Informe um e-mail válido.")
    @Size(max = 250, message = "O e-mail deve ter no máximo 250 caracteres")
    private String email;

    @NotBlank(message = "Informe a senha.")
    @Size(min = 6, max = 100, message = "A senha deve ter entre 6 e 100 caracteres")
    private String senha;

    @NotNull(message = "Selecione o perfil.")
    private PerfilEnum perfil;

    @NotBlank(message = "Informe o CPF")
    @Pattern(regexp = "^(\\d{11}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2})$",
            message = "O CPF deve estar no formato 00000000000 ou 000.000.000-00")
    //@CPF(message = "CPF inválido")
    private String cpf;

    @NotBlank(message = "Informe um telefone")
    @Pattern(regexp = "^[\\d\\s()\\-+]{8,20}$", message = "Telefone inválido")
    private String telefone;

    @Size(max = 20, message = "CRO deve ter no máximo 20 caracteres")
    private String cro;


}
