package com.foodtruck.api.controller;

import com.foodtruck.domain.model.Pedido;
import com.foodtruck.domain.service.PedidoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Validated
public class PedidoController {

  private final PedidoService pedidoService;

  public record ItemPedidoCreateDto(
      @NotNull Long produtoId,
      @NotNull @Positive Integer quantidade
  ) {}

  public record PedidoCreateDto(
      @NotNull Long usuarioId,
      @NotNull Long foodtruckId,
      @NotEmpty List<@Valid ItemPedidoCreateDto> itens
  ) {}

  @PostMapping
  public ResponseEntity<Pedido> criar(@RequestBody @Valid PedidoCreateDto dto) {
    var itens = dto.itens().stream()
        .map(i -> new PedidoService.Item(i.produtoId(), i.quantidade()))
        .toList();
    Pedido p = pedidoService.criar(dto.usuarioId(), dto.foodtruckId(), itens);
    return ResponseEntity.status(201).body(p);
  }

  @GetMapping("/{id}")
  public ResponseEntity<Pedido> buscar(@PathVariable Long id) {
    Optional<Pedido> op = pedidoService.buscar(id);
    return op.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }
}
