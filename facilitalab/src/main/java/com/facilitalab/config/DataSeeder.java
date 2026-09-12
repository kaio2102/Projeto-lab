package com.facilitalab.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.facilitalab.models.PerfilEnum;
import com.facilitalab.models.Usuario;
import com.facilitalab.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.findByPerfil(PerfilEnum.GESTOR).isEmpty()) {
            Usuario gestor = new Usuario();
            gestor.setNome("Admin");
            gestor.setEmail("admin@facilitalab.com");
            gestor.setSenhaHash(passwordEncoder.encode("admin123"));
            gestor.setPerfil(PerfilEnum.GESTOR);
            gestor.setCpf("00000000000");
            gestor.setTelefone("(71) 99999-9999");

            usuarioRepository.save(gestor);
            log.info("Usuário GESTOR padrão criado: admin@facilitalab.com / admin123");
        }
    }
}