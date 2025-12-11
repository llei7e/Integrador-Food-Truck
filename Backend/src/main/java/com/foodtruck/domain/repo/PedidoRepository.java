package com.foodtruck.domain.repo;

import com.foodtruck.domain.model.Pedido;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.*;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

  @Override
  @EntityGraph(attributePaths = {"itens", "itens.produto"})
  List<Pedido> findAll();

  @EntityGraph(attributePaths = {"itens", "itens.produto"})
  Optional<Pedido> findById(Long id);
}
