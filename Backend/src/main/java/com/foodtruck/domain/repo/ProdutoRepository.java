package com.foodtruck.domain.repo;

import com.foodtruck.domain.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
  List<Produto> findByAtivoTrue();
}
