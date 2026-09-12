package com.facilitalab.models;

import java.time.LocalDate;
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
@Table(name = "pedido")
public class Pedido {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id")
private Long id;

@Column(name = "cor")
private String cor;

@Column(name = "estado")
@Enumerated(EnumType.STRING)
private EstadoEnum estado;

@Column(name = "tipo_protese")
@Enumerated(EnumType.STRING)
private TipoProteseEnum tipoProtese;

@Column(name = "material")
@Enumerated(EnumType.STRING)
private MaterialEnum material;

@Column(name = "prioridade")
@Enumerated(EnumType.STRING)
private PrioridadeEnum prioridade;

@Column(name = "observacoes")
private String observacoes;

@ManyToOne
@JoinColumn(name = "dentista_id")
private Usuario dentista;

@ManyToOne
@JoinColumn(name = "cadista_id", nullable = true)
private Usuario cadista;

@Column(name = "data_criacao")
private LocalDateTime dataCriacao;

@Column(name = "data_atualizacao")
private LocalDateTime dataAtualizacao;

@Column(name = "prazo_entrega")
private LocalDate prazoEntrega;



@PrePersist
public void prepersist() {
    this.dataCriacao = LocalDateTime.now();
    }

 @PreUpdate
    public void preupdate() {
        this.dataAtualizacao = LocalDateTime.now();
        }   
}
