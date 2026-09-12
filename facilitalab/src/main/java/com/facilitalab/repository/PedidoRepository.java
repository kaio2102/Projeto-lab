package com.facilitalab.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.facilitalab.models.Pedido;
import com.facilitalab.models.EstadoEnum;
import com.facilitalab.models.PrioridadeEnum;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findByDentistaId(Long dentistaId);

    List<Pedido> findByCadistaId(Long cadistaId);

    List<Pedido> findByEstado(EstadoEnum estado);

    List<Pedido> findByPrioridade(PrioridadeEnum prioridade);

}
