package com.foodtruck.api.controller;

import com.foodtruck.api.dto.PedidosDto; 
import com.foodtruck.domain.model.Pedido;
import com.foodtruck.domain.service.PedidoService;
import com.foodtruck.security.UserDetailsImpl; 
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; 
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller responsável pelo gerenciamento de pedidos
@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Validated
public class PedidoController {

    // Serviço com a lógica de negócio dos pedidos
    private final PedidoService pedidoService;

    // Mapper responsável por converter entidade em DTO
    private final PedidoMapper pedidoMapper; 

    // Endpoint para criação de um novo pedido
    @PostMapping
    public ResponseEntity<PedidosDto.PedidoView> criar(
            @RequestBody @Valid PedidosDto.CriarPedidoRequest dto,
            @AuthenticationPrincipal UserDetailsImpl principal 
    ) {
        // Garante que o usuário esteja autenticado
        if (principal == null) {
            return ResponseEntity.status(401).build(); 
        }
        
        // Cria o pedido associado ao usuário logado
        Pedido p = pedidoService.criar(dto, principal);
        
        // Retorna o pedido criado no formato de visualização
        return ResponseEntity.status(201)
                .body(pedidoMapper.toPedidoView(p));
    }

    // Endpoint para listar todos os pedidos
    @GetMapping
    public ResponseEntity<List<PedidosDto.PedidoView>> listar() {
        // Busca todos os pedidos no sistema
        List<Pedido> pedidos = pedidoService.listar();
       
        // Converte os pedidos para DTO antes de retornar
        return ResponseEntity.ok(
                pedidos.stream()
                       .map(pedidoMapper::toPedidoView)
                       .toList()
        );
    }

    // Endpoint para remover um pedido pelo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        // Verifica se o pedido existe antes de excluir
        if (!pedidoService.existe(id)) {
            return ResponseEntity.notFound().build();
        }

        pedidoService.deletar(id);
        return ResponseEntity.noContent().build(); 
    }

    // Endpoint para atualizar o status de um pedido
    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidosDto.PedidoView> atualizarStatus(
        @PathVariable Long id,
        @RequestBody PedidosDto.AtualizarStatusRequest dto
    ) {
        // Atualiza o status do pedido
        Pedido pedidoAtualizado =
                pedidoService.atualizarStatus(id, dto.status());

        // Retorna o pedido atualizado
        return ResponseEntity.ok(
                pedidoMapper.toPedidoView(pedidoAtualizado)
        );
    }
}
