package com.facilitalab.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.facilitalab.dtos.PedidoCreateDTO;
import com.facilitalab.dtos.PedidoSaidaDTO;
import com.facilitalab.exception.AcessoNegadoException;
import com.facilitalab.models.EstadoEnum;
import com.facilitalab.models.Pedido;
import com.facilitalab.models.PerfilEnum;
import com.facilitalab.models.PrioridadeEnum;
import com.facilitalab.models.Usuario;
import com.facilitalab.repository.PedidoRepository;
import com.facilitalab.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstadoTransicaoValidator estadoTransicaoValidator;

    private PedidoSaidaDTO converter(Pedido pedido) {
        PedidoSaidaDTO saida = new PedidoSaidaDTO();
        saida.setId(pedido.getId());
        saida.setCor(pedido.getCor());
        saida.setMaterial(pedido.getMaterial());
        saida.setTipoProtese(pedido.getTipoProtese());
        saida.setPrazoEntrega(pedido.getPrazoEntrega());
        saida.setEstado(pedido.getEstado());
        saida.setPrioridade(pedido.getPrioridade());
        saida.setObservacoes(pedido.getObservacoes());
        saida.setDataCriacao(pedido.getDataCriacao());
        saida.setDataAtualizacao(pedido.getDataAtualizacao());
        saida.setDentistaId(pedido.getDentista().getId());
        saida.setNomeDentista(pedido.getDentista().getNome());
        saida.setNomeCadista(pedido.getCadista() != null ? pedido.getCadista().getNome() : null);
        return saida;
    }

    // CREATE
    public PedidoSaidaDTO criarPedido(PedidoCreateDTO dto) {
        Usuario autenticado = getUsuarioAutenticado();

        Usuario dentista = usuarioRepository.findById(autenticado.getId())
                .orElseThrow(() -> new RuntimeException("Dentista não encontrado: " + autenticado.getId()));

        Pedido pedido = new Pedido();
        pedido.setCor(dto.getCor());
        pedido.setMaterial(dto.getMaterial());
        pedido.setTipoProtese(dto.getTipoProtese());
        pedido.setPrazoEntrega(dto.getPrazoEntrega());
        pedido.setDentista(dentista);
        pedido.setObservacoes(dto.getObservacoes());
        pedido.setPrioridade(PrioridadeEnum.NORMAL);
        pedido.setEstado(EstadoEnum.AGUARDANDO_TRIAGEM);

        return converter(pedidoRepository.save(pedido));
    }

    // READ - por ID
    public PedidoSaidaDTO buscarPedidoPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        verificarAcessoDentista(pedido, getUsuarioAutenticado());
        return converter(pedido);
    }

    // READ - por dentista
    public List<PedidoSaidaDTO> buscarPedidosPorDentistaId(Long dentistaId) {
        Usuario autenticado = getUsuarioAutenticado();
        if (autenticado.getPerfil() == PerfilEnum.DENTISTA &&
                !autenticado.getId().equals(dentistaId)) {
            throw new AcessoNegadoException();
        }
        return pedidoRepository.findByDentistaId(dentistaId).stream()
                .map(this::converter)
                .collect(Collectors.toList());
    }

    // READ - por cadista
    public List<PedidoSaidaDTO> buscarPedidosPorCadistaId(Long cadistaId) {
        List<Pedido> pedidos = pedidoRepository.findByCadistaId(cadistaId);
        return pedidos.stream()
                .map(this::converter)
                .collect(Collectors.toList());
    }

    // READ - por estado
    public List<PedidoSaidaDTO> buscarPedidosPorEstado(EstadoEnum estado) {
        List<Pedido> pedidos = pedidoRepository.findByEstado(estado);
        return pedidos.stream()
                .map(this::converter)
                .collect(Collectors.toList());
    }

    // READ - por prioridade
    public List<PedidoSaidaDTO> buscarPedidosPorPrioridade(PrioridadeEnum prioridade) {
        List<Pedido> pedidos = pedidoRepository.findByPrioridade(prioridade);
        return pedidos.stream()
                .map(this::converter)
                .collect(Collectors.toList());
    }

    // READ - todos
    public List<PedidoSaidaDTO> buscarTodosPedidos() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        return pedidos.stream()
                .map(this::converter)
                .collect(Collectors.toList());
    }

    // UPDATE - estado
    public PedidoSaidaDTO atualizarEstadoPedido(Long id, EstadoEnum novoEstado, Long cadistaId) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        estadoTransicaoValidator.validar(pedido.getEstado(), novoEstado);

        pedido.setEstado(novoEstado);

        // Atribui o cadista quando o pedido entra em análise
        if (novoEstado == EstadoEnum.EM_ANALISE && cadistaId != null) {
            Usuario cadista = usuarioRepository.findById(cadistaId)
                    .orElseThrow(() -> new RuntimeException("Cadista não encontrado"));
            pedido.setCadista(cadista);
        }

        Pedido salvo = pedidoRepository.save(pedido);
        return converter(salvo);
    }

    // UPDATE
    public PedidoSaidaDTO atualizarPedido(Long id, PedidoCreateDTO dto) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        verificarAcessoDentista(pedido, getUsuarioAutenticado());

        Usuario dentista = usuarioRepository.findById(dto.getDentistaId())
                .orElseThrow(() -> new RuntimeException("Dentista não encontrado"));

        pedido.setDentista(dentista);
        pedido.setCor(dto.getCor());
        pedido.setMaterial(dto.getMaterial());
        pedido.setTipoProtese(dto.getTipoProtese());
        pedido.setPrazoEntrega(dto.getPrazoEntrega());
        pedido.setObservacoes(dto.getObservacoes());
        pedido.setPrioridade(dto.getPrioridade());

        return converter(pedidoRepository.save(pedido));
    }

    // DELETE
    public void deletarPedido(Long id) {
        if (!pedidoRepository.existsById(id)) {
            throw new RuntimeException("Pedido não encontrado");
        }
        pedidoRepository.deleteById(id);
    }

    private Usuario getUsuarioAutenticado() {
        return (Usuario) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
    }

    private void verificarAcessoDentista(Pedido pedido, Usuario autenticado) {
        if (autenticado.getPerfil() == PerfilEnum.DENTISTA &&
                !pedido.getDentista().getId().equals(autenticado.getId())) {
            throw new AcessoNegadoException();
        }
    }
}
