package com.foodtruck.domain.service;

import com.foodtruck.domain.model.Estoque;
import com.foodtruck.domain.model.Produto;
import com.foodtruck.domain.repo.EstoqueRepository;
import com.foodtruck.domain.repo.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EstoqueService {

  private final EstoqueRepository estoqueRepo;
  private final ProdutoRepository produtoRepo;

  public Estoque criar(Long produtoId, Integer quantidade, String unidade) {
    Produto prod = produtoRepo.findById(produtoId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produto não encontrado"));

    // se quiser garantir 1 registro de estoque por produto, recuse se já houver
    if (estoqueRepo.existsByProduto_Id(produtoId)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe registro de estoque para este produto");
    }

    Estoque e = new Estoque();
    e.setProduto(prod);
    e.setQuantidade(quantidade);
    e.setUnidade(unidade);
    return estoqueRepo.save(e);
  }

  public List<Estoque> listar() {
    return estoqueRepo.findAll();
  }

  public Optional<Estoque> buscar(Long id) {
    return estoqueRepo.findById(id);
  }

  public boolean existe(Long id) {
    return estoqueRepo.existsById(id);
  }

  public void deletar(Long id) {
    if (!estoqueRepo.existsById(id)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Estoque não encontrado");
    }
    estoqueRepo.deleteById(id);
  }
}
