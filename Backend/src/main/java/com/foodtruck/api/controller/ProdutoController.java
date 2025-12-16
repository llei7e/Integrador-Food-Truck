package com.foodtruck.api.controller;

import com.foodtruck.domain.model.Produto;
import com.foodtruck.domain.service.ProdutoService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller responsável pelo gerenciamento de produtos
@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
@Validated
public class ProdutoController {

  // Serviço que contém a lógica de negócio dos produtos
  private final ProdutoService produtoService;

  // DTO usado para criação de produtos
  public record ProdutoCreateDto(
      @NotBlank String nome,               // Nome do produto
      String descricao,                    // Descrição opcional
      @NotNull @Positive Double preco,     // Preço do produto
      @NotNull Long categoriaId,            // Categoria associada
      Boolean ativo                         // Status do produto
  ) {}

  // Endpoint para criar um novo produto
  @PostMapping
  public ResponseEntity<Produto> criar(@RequestBody @Validated ProdutoCreateDto dto) {
    // Cria o produto com base nos dados recebidos
    Produto p = produtoService.criar(
            dto.nome(),
            dto.descricao(),
            dto.preco(),
            dto.categoriaId(),
            dto.ativo()
    );

    return ResponseEntity.status(HttpStatus.CREATED).body(p);
  }

  // Endpoint para listar todos os produtos
  @GetMapping
  public List<Produto> listar() {
    // Retorna todos os produtos cadastrados
    return produtoService.listarTodos();
  }

  // Endpoint para remover um produto pelo ID
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletar(@PathVariable Long id) {
    // Verifica se o produto existe antes de excluir
    if (!produtoService.existe(id)) {
      return ResponseEntity.notFound().build();
    }

    produtoService.deletar(id);
    return ResponseEntity.noContent().build();
  }

  // DTO usado para atualizar o status do produto (ativo/inativo)
  public record AtualizarAtivoDto(
        @NotNull Integer ativo              // 1 = ativo, 0 = inativo
  ) {}

  // Endpoint para atualizar o status do produto
  @PatchMapping("/{id}/status")
  public ResponseEntity<Produto> atualizarAtivo(
        @PathVariable Long id,
        @RequestBody @Validated AtualizarAtivoDto dto
  ) {
    // Atualiza o status do produto
    Produto produtoAtualizado =
            produtoService.atualizarAtivo(id, dto.ativo());

    return ResponseEntity.ok(produtoAtualizado);
  }
}
