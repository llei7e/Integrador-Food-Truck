package com.foodtruck.api.controller;

import com.foodtruck.api.dto.PedidosDto; // --- 1. Importar o DTO ---
import com.foodtruck.domain.model.Pedido;
import com.foodtruck.domain.service.PedidoService;
import com.foodtruck.security.UserDetailsImpl; // --- 2. Importar UserDetailsImpl ---
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // --- 3. Importar @AuthenticationPrincipal ---
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Validated
public class PedidoController {

    private final PedidoService pedidoService;
    private final PedidoMapper pedidoMapper; // --- 4. Injetar o Mapper (ver abaixo) ---

    // --- REMOVIDOS os records DTO internos ---

    @PostMapping
    public ResponseEntity<PedidosDto.PedidoView> criar(
            @RequestBody @Valid PedidosDto.CriarPedidoRequest dto,
            @AuthenticationPrincipal UserDetailsImpl principal // --- 5. Injetar usuário ---
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).build(); // Segurança extra
        }
        
        // --- 6. Chamar o novo service ---
        Pedido p = pedidoService.criar(dto, principal);
        
        // --- 7. Retornar o DTO de Resposta (PedidoView) ---
        return ResponseEntity.status(201).body(pedidoMapper.toPedidoView(p));
    }

    @GetMapping
    public ResponseEntity<List<PedidosDto.PedidoView>> listar() {
        List<Pedido> pedidos = pedidoService.listar();
        // Converte a lista de Entidades para uma lista de DTOs de View
        return ResponseEntity.ok(pedidos.stream().map(pedidoMapper::toPedidoView).toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!pedidoService.existe(id)) return ResponseEntity.notFound().build();
        pedidoService.deletar(id);
        return ResponseEntity.noContent().build(); // 204
    }
}