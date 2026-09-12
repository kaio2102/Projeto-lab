package com.facilitalab.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.validation.FieldError;

import com.facilitalab.dtos.LoginRequestDTO;
import com.facilitalab.dtos.LoginResponseDTO;
import com.facilitalab.dtos.RecuperarSenhaRequestDTO;
import com.facilitalab.dtos.RedefinirSenhaRequestDTO;
import com.facilitalab.service.AuthService;
import com.facilitalab.service.RecuperacaoSenhaService;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final RecuperacaoSenhaService recuperacaoSenhaService;
    public AuthController(AuthService authService, RecuperacaoSenhaService recuperacaoSenhaService) {
        this.authService = authService;
        this.recuperacaoSenhaService = recuperacaoSenhaService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginRequestDTO request) {
        return ResponseEntity.ok(authService.autenticar(request.getEmail(), request.getSenha()));
    }

    // Credenciais inválidas — mensagem genérica para não revelar se o e-mail existe
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, List<String>>> handleAuthError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("errors", List.of("E-mail ou senha incorretos.")));
    }

    // Campos obrigatórios ausentes ou mal formatados no corpo da requisição
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> erros = ex.getBindingResult().getFieldErrors()
                .stream().map(FieldError::getDefaultMessage).toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("errors", erros));
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Void>solicitarRecuperacao(@RequestBody @Valid RecuperarSenhaRequestDTO request){
        recuperacaoSenhaService.solicitarRecuperacao(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Void> redefinirSenha(@RequestBody @Valid RedefinirSenhaRequestDTO request){
        recuperacaoSenhaService.redefinirSenha(request.getToken(), request.getNovaSenha());
        return ResponseEntity.ok().build();
    }
    
}