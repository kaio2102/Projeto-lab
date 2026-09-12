package com.facilitalab.models;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

@Entity
@Table(name = "usuario")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "email", nullable = false, unique = true, length = 250)
    private String email;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    // length = 20 comporta todos os valores atuais e futuros de PerfilEnum (maior: "RECEPCAO" = 8 chars)
    @Column(name = "perfil", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PerfilEnum perfil;

    // nullable = false reflete o @PrePersist que sempre preenche antes do primeiro INSERT
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @PrePersist
    public void prepersist() {
        this.dataCriacao = LocalDateTime.now();
    }

    // CPF armazenado somente com dígitos (11 chars); normalização feita no service
    @Column(name = "cpf", nullable = false, length = 11, unique = true)
    private String cpf;

    @Column(name = "telefone", nullable = false, length = 20)
    private String telefone;

    // Só DENTISTA
    @Column(name = "cro", length = 20)
    private String cro;
    
}
