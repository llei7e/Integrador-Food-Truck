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

@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
@Validated
public class EstoqueController {

  private final EstoqueService estoqueService;

  public record EstoqueCreateDto(
      @NotNull Long produtoId,
      @NotNull @PositiveOrZero Integer quantidade,
      String unidade
  ) {}

  @PostMapping
  public ResponseEntity<Estoque> criar(@RequestBody @Valid EstoqueCreateDto dto) {
    Estoque e = estoqueService.criar(dto.produtoId(), dto.quantidade(), dto.unidade());
    return ResponseEntity.status(201).body(e);
  }

  @GetMapping
  public List<Estoque> listar() {
    return estoqueService.listar();
  }

  @GetMapping("/{id}")
  public ResponseEntity<Estoque> buscar(@PathVariable Long id) {
    Optional<Estoque> op = estoqueService.buscar(id);
    return op.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletar(@PathVariable Long id) {
    if (!estoqueService.existe(id)) return ResponseEntity.notFound().build();
    estoqueService.deletar(id);
    return ResponseEntity.noContent().build();
  }
}
