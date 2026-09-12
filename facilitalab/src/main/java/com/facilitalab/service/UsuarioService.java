package com.facilitalab.service;

import java.util.List;

import com.facilitalab.dtos.UsuarioUpdateDTO;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.facilitalab.dtos.UsuarioCreateDTO;
import com.facilitalab.dtos.UsuarioSaidaDTO;
import com.facilitalab.models.PerfilEnum;
import com.facilitalab.models.Usuario;
import com.facilitalab.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    // BCryptPasswordEncoder registrado em SecurityConfig
    private final PasswordEncoder passwordEncoder;

    // CREATE
    public UsuarioSaidaDTO criar(UsuarioCreateDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado: " + dto.getEmail());
        }

        // Normaliza antes da busca para que "123.456.789-01" e "12345678901" sejam o mesmo CPF
        String cpf = normalizarCpf(dto.getCpf());
        if (usuarioRepository.existsByCpf(cpf)) {
            throw new IllegalArgumentException("CPF já cadastrado: " + dto.getCpf());
        }

        boolean isDentista = dto.getPerfil() == PerfilEnum.DENTISTA;

        // CRO é obrigatório apenas para dentistas; demais perfis devem ter null
        if (isDentista) {
            if (dto.getCro() == null || dto.getCro().isBlank())
                throw new IllegalArgumentException("CRO é obrigatório para dentistas.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenhaHash(passwordEncoder.encode(dto.getSenha()));
        usuario.setPerfil(dto.getPerfil());
        usuario.setCpf(cpf);
        usuario.setTelefone(dto.getTelefone());
        usuario.setCro(isDentista ? dto.getCro() : null);

        return toSaidaDTO(usuarioRepository.save(usuario));
    }

    // READ - todos
    public List<UsuarioSaidaDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toSaidaDTO)
                .toList();
    }

    // READ - por e-mail
    public UsuarioSaidaDTO buscarPorEmail(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com e-mail: " + email));
        return toSaidaDTO(usuario);
    }

    // READ - por ID
    public UsuarioSaidaDTO buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        return toSaidaDTO(usuario);
    }

    // READ - por perfil
    public List<UsuarioSaidaDTO> listarPorPerfil(PerfilEnum perfil) {
        return usuarioRepository.findByPerfil(perfil)
                .stream()
                .map(this::toSaidaDTO)
                .toList();
    }

    // UPDATE
    public UsuarioSaidaDTO atualizar(Long id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));

        // Verifica unicidade de e-mail excluindo o próprio usuário
        usuarioRepository.findByEmail(dto.getEmail()).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new IllegalArgumentException("E-mail já cadastrado: " + dto.getEmail());
            }
        });

        // Normaliza antes da busca — mesma razão do criar()
        String cpf = normalizarCpf(dto.getCpf());

        // Verifica unicidade de CPF excluindo o próprio usuário
        usuarioRepository.findByCpf(cpf).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new IllegalArgumentException("CPF já cadastrado: " + dto.getCpf());
            }
        });

        boolean isDentista = dto.getPerfil() == PerfilEnum.DENTISTA;

        // CRO é obrigatório apenas para dentistas; demais perfis devem ter null
        if (isDentista) {
            if (dto.getCro() == null || dto.getCro().isBlank())
                throw new IllegalArgumentException("CRO é obrigatório para dentistas.");
        }

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setPerfil(dto.getPerfil());
        usuario.setCpf(cpf);
        usuario.setTelefone(dto.getTelefone());
        usuario.setCro(isDentista ? dto.getCro() : null);

        // Senha é opcional no update — null ou vazio mantém a senha atual
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenhaHash(passwordEncoder.encode(dto.getSenha()));
        }

        return toSaidaDTO(usuarioRepository.save(usuario));
    }

    // DELETE
    public void deletar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado com ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    // Remove pontos e traço para garantir que "123.456.789-01" e "12345678901" sejam tratados como o mesmo CPF
    private String normalizarCpf(String cpf) {
        return cpf.replaceAll("\\D", "");
    }

    private UsuarioSaidaDTO toSaidaDTO(Usuario usuario) {
        return new UsuarioSaidaDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name(),
                usuario.getDataCriacao(),
                usuario.getCpf(),
                usuario.getTelefone(),
                usuario.getCro()
        );
    }

     public Usuario buscarEntidadePorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com e-mail: " + email));
    }
}