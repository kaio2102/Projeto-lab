package com.facilitalab.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.facilitalab.models.TokenRecuperacao;
import com.facilitalab.models.Usuario;

import jakarta.transaction.Transactional;

public interface TokenRecuperacaoRepository extends JpaRepository<TokenRecuperacao, Long> {

    Optional<TokenRecuperacao> findByToken(String token);

    @Transactional
    void deleteByUsuario(Usuario usuario);
}