package com.foodtruck.domain.service;

import com.foodtruck.domain.model.Categoria;
import com.foodtruck.domain.model.Produto;
import com.foodtruck.domain.repo.CategoriaRepository;
import com.foodtruck.domain.repo.ProdutoRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class ProdutoService {
  private final ProdutoRepository produtoRepo;
  private final CategoriaRepository categoriaRepo;

  public Produto criar(String nome, String descricao, Integer preco, @NotNull Long categoriaId, Boolean ativo) {
    Categoria categoria = categoriaRepo.findById(categoriaId)
        .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));
    Produto p = new Produto();
    p.setNome(nome);
    p.setDescricao(descricao);
    p.setPreco(preco);
    p.setCategoria(categoria);
    p.setAtivo(ativo == null ? true : ativo);
    return produtoRepo.save(p);
  }

  public List<Produto> listarAtivos() {
    return produtoRepo.findByAtivoTrue();
  }

  public boolean existe(Long id) { return produtoRepo.existsById(id); }
  public void deletar(Long id)    { produtoRepo.deleteById(id); }

  
}
