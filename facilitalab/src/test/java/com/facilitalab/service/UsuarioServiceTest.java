package com.facilitalab.service;

import com.facilitalab.dtos.UsuarioCreateDTO;
import com.facilitalab.models.PerfilEnum;
import com.facilitalab.repository.UsuarioRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    @Test
    void naoDeveCriarUsuarioComEmailDuplicado() {

        UsuarioCreateDTO dto = new UsuarioCreateDTO();

        dto.setNome("Carlos Nelson");
        dto.setEmail("carlos@gmail.com");
        dto.setSenha("123456");
        dto.setPerfil(PerfilEnum.GESTOR);
        dto.setCpf("12345678901");

        when(usuarioRepository.existsByEmail(dto.getEmail()))
                .thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () -> usuarioService.criar(dto)
        );
    }
}