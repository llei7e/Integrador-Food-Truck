package com.foodtruck.domain.repo;

import com.foodtruck.domain.model.Estoque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstoqueRepository extends JpaRepository<Estoque, Long> {
  Optional<Estoque> findByProduto_Id(Long produtoId);
  boolean existsByProduto_Id(Long produtoId);
}
