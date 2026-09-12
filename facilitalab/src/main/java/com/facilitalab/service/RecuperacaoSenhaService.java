package com.facilitalab.service;

import java.time.LocalDateTime;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.facilitalab.models.TokenRecuperacao;
import com.facilitalab.models.Usuario;
import com.facilitalab.repository.TokenRecuperacaoRepository;
import com.facilitalab.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecuperacaoSenhaService {

   private final TokenRecuperacaoRepository tokenRecuperacaoRepository;
   private final UsuarioRepository usuarioRepository;
   private final PasswordEncoder passwordEncoder;
   private final JavaMailSender mailSender;

  

    public void solicitarRecuperacao(String email) {
    usuarioRepository.findByEmail(email).ifPresent(usuario -> {
        tokenRecuperacaoRepository.deleteByUsuario(usuario);

        String token = java.util.UUID.randomUUID().toString();
        TokenRecuperacao tokenRecuperacao = new TokenRecuperacao();
        tokenRecuperacao.setToken(token);
        tokenRecuperacao.setUsuario(usuario);
        tokenRecuperacaoRepository.save(tokenRecuperacao);

        String link = "http://localhost:8081/redefinir-senha?token=" + token;

        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(usuario.getEmail());
        mensagem.setSubject("Recuperação de senha - FacilitaLab");
        mensagem.setText("Olá, " + usuario.getNome() + "!\n\n"
                + "Recebemos uma solicitação para redefinir sua senha.\n"
                + "Clique no link abaixo para criar uma nova senha:\n\n"
                + link + "\n\n"
                + "O link expira em 1 hora.\n"
                + "Se não foi você, ignore este e-mail.");
        mailSender.send(mensagem);
      });
    }

    public void redefinirSenha(String token, String novaSenha) {
        TokenRecuperacao tokenRecuperacao = tokenRecuperacaoRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token de recuperação inválido ou expirado."));
                if (tokenRecuperacao.isUsado()) {
                    throw new RuntimeException("Token já utilizado.");
                }
                if (tokenRecuperacao.getExpiracao().isBefore(LocalDateTime.now())) {
                    throw new RuntimeException("Token expirado.");
                }

        Usuario usuario = tokenRecuperacao.getUsuario();
        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
        tokenRecuperacao.setUsado(true);
        tokenRecuperacaoRepository.delete(tokenRecuperacao);
    }
}    

