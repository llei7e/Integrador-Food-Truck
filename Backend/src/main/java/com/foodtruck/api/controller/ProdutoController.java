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


@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
@Validated
public class ProdutoController {

  private final ProdutoService produtoService;

  public record ProdutoCreateDto(
      @NotBlank String nome,
      String descricao,
      @NotNull @Positive Double preco,  // em centavos
      @NotNull Long categoriaId,
      Boolean ativo
  ) {}

  @PostMapping
  public ResponseEntity<Produto> criar(@RequestBody @Validated ProdutoCreateDto dto) {
    Produto p = produtoService.criar(dto.nome(), dto.descricao(), dto.preco(), dto.categoriaId(), dto.ativo());
    return ResponseEntity.status(HttpStatus.CREATED).body(p);
  }

  @GetMapping
  public List<Produto> listar() {
    return produtoService.listarTodos();
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletar(@PathVariable Long id) {
    if (!produtoService.existe(id)) return ResponseEntity.notFound().build();
    produtoService.deletar(id);
    return ResponseEntity.noContent().build();
  }

  public record AtualizarAtivoDto(
        @NotNull Integer ativo // 0 ou 1
  ) {}


  @PatchMapping("/{id}/ativo")
  public ResponseEntity<Produto> atualizarAtivo(
        @PathVariable Long id,
        @RequestBody @Validated AtualizarAtivoDto dto
) {
    Produto produtoAtualizado = produtoService.atualizarAtivo(id, dto.ativo());
    return ResponseEntity.ok(produtoAtualizado);
}

}
