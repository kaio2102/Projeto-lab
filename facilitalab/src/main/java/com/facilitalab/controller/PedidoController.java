package com.facilitalab.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.facilitalab.dtos.PedidoCreateDTO;
import com.facilitalab.dtos.PedidoSaidaDTO;
import com.facilitalab.exception.AcessoNegadoException;
import com.facilitalab.exception.TransicaoInvalidaException;
import com.facilitalab.models.EstadoEnum;
import com.facilitalab.models.PrioridadeEnum;
import com.facilitalab.service.PedidoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    // POST /pedidos
    @PostMapping
    public ResponseEntity<PedidoSaidaDTO> criarPedido(@Valid @RequestBody PedidoCreateDTO dto) {
        return ResponseEntity.status(201).body(pedidoService.criarPedido(dto));
    }

    // GET /pedidos/id/{id}
    @GetMapping("/id/{id}")

    public ResponseEntity<PedidoSaidaDTO> buscarPedidoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.buscarPedidoPorId(id));
    }

    // GET /pedidos/dentista/{dentistaId}
    @GetMapping("/dentista/{dentistaId}")
    public ResponseEntity<List<PedidoSaidaDTO>> listarPedidosPorDentista(@PathVariable Long dentistaId) {
        return ResponseEntity.ok(pedidoService.buscarPedidosPorDentistaId(dentistaId));
    }

    // GET /pedidos
    @GetMapping
    public ResponseEntity<List<PedidoSaidaDTO>> listarTodosPedidos() {
        return ResponseEntity.ok(pedidoService.buscarTodosPedidos());
    }

    // GET /pedidos/prioridade
    @GetMapping("/prioridade")
    public ResponseEntity<List<PedidoSaidaDTO>> listarPedidosPorPrioridade(@RequestParam PrioridadeEnum prioridade) {
        return ResponseEntity.ok(pedidoService.buscarPedidosPorPrioridade(prioridade));
    }

    // GET /pedidos/cadista/{cadistaId}
    @GetMapping("/cadista/{cadistaId}")
    public ResponseEntity<List<PedidoSaidaDTO>> listarPedidosPorCadista(@PathVariable Long cadistaId) {
        return ResponseEntity.ok(pedidoService.buscarPedidosPorCadistaId(cadistaId));
    }

    // GET /pedidos/estado?estado=AGUARDANDO_TRIAGEM
    @GetMapping("/estado")
    public ResponseEntity<List<PedidoSaidaDTO>> listarPedidosPorEstadoRequestParam(@RequestParam EstadoEnum estado) {
        return ResponseEntity.ok(pedidoService.buscarPedidosPorEstado(estado));
    }

    // UPDATE /{id}/estado
    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoSaidaDTO> atualizarEstado(
            @PathVariable Long id,
            @RequestParam EstadoEnum novoEstado,
            @RequestParam(required = false) Long cadistaId) {
        return ResponseEntity.ok(pedidoService.atualizarEstadoPedido(id, novoEstado, cadistaId));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<PedidoSaidaDTO> atualizarPedido(@PathVariable Long id,
            @Valid @RequestBody PedidoCreateDTO dto) {
        return ResponseEntity.ok(pedidoService.atualizarPedido(id, dto));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPedido(@PathVariable Long id) {
        pedidoService.deletarPedido(id);
        return ResponseEntity.noContent().build();
    }

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

    @ExceptionHandler(TransicaoInvalidaException.class)
    public ResponseEntity<Map<String, List<String>>> handleTransicaoInvalida(TransicaoInvalidaException ex) {
        return ResponseEntity.status(HttpStatus.valueOf(422))
                .body(Map.of("errors", List.of(ex.getMessage())));
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<Map<String, List<String>>> handleAcessoNegado(AcessoNegadoException ex) {
        return ResponseEntity.status(403)
                .body(Map.of("errors", List.of(ex.getMessage())));
    }

}
