package com.foodtruck.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

// DTOs usados para criação, atualização e visualização de pedidos
public class PedidosDto {

    // DTO para receber os itens de um pedido
    public record ItemPedidoRequest(
            @NotNull
            Long produtoId,              // ID do produto

            @NotNull
            @Min(1)
            Integer quantidade           // Quantidade do produto
    ) {}

    // DTO para criação de um novo pedido
    public record CriarPedidoRequest(
            @NotBlank
            String status,               // Status inicial do pedido

            @NotNull
            Long truck_id,               // ID do food truck

            @NotBlank
            String metodoPagamento,      // Forma de pagamento

            @NotEmpty
            @Valid
            List<ItemPedidoRequest> itens // Lista de itens do pedido
    ) {}

    // DTO para visualização de um item do pedido
    public record ItemPedidoView(
            Long id,                     // ID do item
            Long produtoId,              // ID do produto
            String nomeProduto,          // Nome do produto
            int quantidade,              // Quantidade
            Double precoUnitario,        // Preço por unidade
            Double precoTotalItem        // Total do item (preço x quantidade)
    ) {}

    // DTO para visualização completa de um pedido
    public record PedidoView(
            Long id,                     // ID do pedido
            String status,               // Status atual
            Double total,                // Valor total do pedido
            String metodoPagamento,      // Forma de pagamento
            Instant dataCriacao,         // Data de criação
            Long truckId,                // ID do food truck
            List<ItemPedidoView> itens   // Itens do pedido
    ) {}

    // DTO para atualização do status do pedido
    public static record AtualizarStatusRequest(
        String status                   // Novo status do pedido
    ) {}
}
