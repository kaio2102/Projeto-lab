package com.facilitalab.controller;

import java.util.List;

import com.facilitalab.dtos.UsuarioUpdateDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.facilitalab.dtos.UsuarioCreateDTO;
import com.facilitalab.dtos.UsuarioSaidaDTO;
import com.facilitalab.models.PerfilEnum;
import com.facilitalab.service.UsuarioService;

import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.Map;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // POST /usuarios
    @PostMapping
    public ResponseEntity<UsuarioSaidaDTO> criar(@RequestBody @Valid UsuarioCreateDTO dto) {
        UsuarioSaidaDTO criado = usuarioService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    // GET /usuarios
    @GetMapping
    public ResponseEntity<List<UsuarioSaidaDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // GET /usuarios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioSaidaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    // GET /usuarios/perfil/{perfil}
    @GetMapping("/perfil/{perfil}")
    public ResponseEntity<List<UsuarioSaidaDTO>> listarPorPerfil(@PathVariable PerfilEnum perfil) {
        return ResponseEntity.ok(usuarioService.listarPorPerfil(perfil));
    }

    // GET /usuarios/email/{email}
    @GetMapping("/email/{email}")
    public ResponseEntity<UsuarioSaidaDTO> buscarPorEmail(@PathVariable String email) {
        return ResponseEntity.ok(usuarioService.buscarPorEmail(email));
    }

    // PUT /usuarios/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioSaidaDTO> atualizar(
            @PathVariable Long id,
            @RequestBody @Valid UsuarioUpdateDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizar(id, dto));
    }

    // DELETE /usuarios/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // Regra de negócio violada (e-mail/CPF duplicado, CRO ausente para dentista)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, List<String>>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("errors", List.of(ex.getMessage())));
    }

    // Falha de validação Bean Validation (@NotBlank, @Size, @Pattern, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> handleValidation(MethodArgumentNotValidException ex) {
        List<String> erros = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("errors", erros));
    }

    // Recurso não encontrado (busca por ID, e-mail ou CPF inexistente)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, List<String>>> handleNotFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("errors", List.of(ex.getMessage())));
    }
}