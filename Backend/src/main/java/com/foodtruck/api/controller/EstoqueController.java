package com.foodtruck.api.controller;

import com.foodtruck.domain.model.Estoque;
import com.foodtruck.domain.service.EstoqueService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


// Controller responsável pelo controle de estoque dos produtos
@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
@Validated
public class EstoqueController {

  // Serviço que contém a lógica de negócio do estoque
  private final EstoqueService estoqueService;

  // DTO usado para criação de registros de estoque
  public record EstoqueCreateDto(
      @NotNull Long produtoId, // ID do produto
      @NotNull @PositiveOrZero Integer quantidade,  // Quantidade inicial em estoque
      String unidade // Unidade de medida (ex: kg, unidade)
  ) {}

  // Endpoint para criar um novo registro de estoque
  @PostMapping
  public ResponseEntity<Estoque> criar(@RequestBody @Valid EstoqueCreateDto dto) {
    // Cria o estoque associado a um produto
    Estoque e = estoqueService.criar(dto.produtoId(), dto.quantidade(), dto.unidade());
    return ResponseEntity.status(201).body(e);
  }

   // Endpoint para listar todos os estoques
  @GetMapping
  public List<Estoque> listar() {
    // Retorna todos os registros de estoque
    return estoqueService.listar();
  }

  // Endpoint para buscar um estoque pelo ID
  @GetMapping("/{id}")
  public ResponseEntity<Estoque> buscar(@PathVariable Long id) {
    // Procura o estoque e retorna 404 se não existir
    Optional<Estoque> op = estoqueService.buscar(id);
    return op.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  // Endpoint para remover um registro de estoque
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletar(@PathVariable Long id) {
    // Verifica se o estoque existe antes de deletar
    if (!estoqueService.existe(id)) return ResponseEntity.notFound().build();
    estoqueService.deletar(id);
    return ResponseEntity.noContent().build();
  }
}
