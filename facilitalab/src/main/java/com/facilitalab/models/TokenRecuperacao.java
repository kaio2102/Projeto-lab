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
@Table(name = "token_recuperacao")
public class TokenRecuperacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "token", unique = true)
    private String token;
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    @Column(name = "expiracao")
    private LocalDateTime expiracao;
    @Column(name = "usado")
    private boolean usado;

    @PrePersist
    public void prePersist() {
        this.expiracao = LocalDateTime.now().plusHours(1);
        this.usado = false;
    }
}