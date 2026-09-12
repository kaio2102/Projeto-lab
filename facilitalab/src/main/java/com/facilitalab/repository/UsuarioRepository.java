package com.facilitalab.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.facilitalab.models.PerfilEnum;
import com.facilitalab.models.Usuario;

import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Usuario> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    List<Usuario> findByPerfil(PerfilEnum perfil);
}