package com.foodtruck.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
// import jakarta.validation.constraints.Positive; // Não mais necessário aqui
import java.time.Instant;
import java.util.List;

public class PedidosDto {

    /**
     * DTO de Item (Requisição): precoUnitario removido
     */
    public record ItemPedidoRequest(
            @NotNull
            Long produtoId,

            @NotNull
            @Min(1)
            Integer quantidade
            
            // precoUnitario FOI REMOVIDO
    ) {}

    /**
     * DTO de Pedido (Requisição): total removido
     */
    public record CriarPedidoRequest(
            // total FOI REMOVIDO

            @NotBlank
            String status,

            @NotNull
            Long truck_id,
            
            @NotBlank
            String metodoPagamento,

            @NotEmpty 
            @Valid    
            List<ItemPedidoRequest> itens
    ) {}

    // --- DTOs de Resposta (Views) não mudam ---
    // (Eles são o que o backend *envia* de volta, e ainda queremos enviar o total e os preços)
    public record ItemPedidoView(
            Long id,
            Long produtoId,
            String nomeProduto, 
            int quantidade,
            Double precoUnitario,
            Double precoTotalItem
    ) {}

    public record PedidoView(
            Long id,
            String status,
            Double total,
            String metodoPagamento,
            Instant dataCriacao, 
            Long truckId,
            List<ItemPedidoView> itens
    ) {}

    public static record AtualizarStatusRequest(
        String status
    ) {}
}