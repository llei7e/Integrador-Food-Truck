package com.foodtruck.domain.service;

import com.foodtruck.domain.model.Categoria;
import com.foodtruck.domain.model.Produto;
import com.foodtruck.domain.repo.CategoriaRepository;
import com.foodtruck.domain.repo.ProdutoRepository;

import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service @RequiredArgsConstructor
public class ProdutoService {
  private final ProdutoRepository produtoRepo;
  private final CategoriaRepository categoriaRepo;

  public Produto criar(String nome, String descricao, Double preco, @NotNull Long categoriaId, Boolean ativo) {
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

  public List<Produto> listarTodos() {
    return produtoRepo.findAll();
  }

  public boolean existe(Long id) { return produtoRepo.existsById(id); }
  public void deletar(Long id)    { produtoRepo.deleteById(id); }


  @Transactional
  public Produto atualizarAtivo(Long id, Integer ativo) {
    Produto produto = produtoRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));

    // converte 0/1 para boolean
    boolean ativoBoolean = (ativo != null && ativo == 1);
    produto.setAtivo(ativoBoolean);

    return produtoRepo.save(produto);
}


  
}
