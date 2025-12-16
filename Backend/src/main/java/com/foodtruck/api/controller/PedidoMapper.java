package com.foodtruck.api.controller;

import com.foodtruck.api.dto.PedidosDto;
import com.foodtruck.domain.model.ItemPedido;
import com.foodtruck.domain.model.Pedido;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

// Mapper responsável por converter entidades de pedido em DTOs
@Component
public class PedidoMapper {

    // Converte a entidade Pedido para o DTO de visualização
    public PedidosDto.PedidoView toPedidoView(Pedido pedido) {
        // Evita erro caso o pedido seja nulo
        if (pedido == null) return null;

        // Converte os itens do pedido para DTO
        var itensView = pedido.getItens().stream()
                .map(this::toItemPedidoView)
                .collect(Collectors.toList());

        // Monta o DTO final do pedido
        return new PedidosDto.PedidoView(
                pedido.getId(),
                pedido.getStatus(),
                pedido.getTotal(),              // Valor total do pedido
                pedido.getMetodoPagamento(),
                pedido.getDataCriacao(),
                pedido.getTruckId(),
                itensView
        );
    }

    // Converte a entidade ItemPedido para o DTO de item do pedido
    public PedidosDto.ItemPedidoView toItemPedidoView(ItemPedido item) {
        // Evita erro caso o item seja nulo
        if (item == null) return null;

        // Recupera o preço unitário do produto
        var precoUnitario = item.getProduto().getPreco(); 
        var quantidade = item.getQuantidade();

        // Calcula o total do item (preço x quantidade)
        var totalItem = precoUnitario * quantidade;

        // Retorna o DTO do item do pedido
        return new PedidosDto.ItemPedidoView(
                item.getId(),
                item.getProduto().getId(),
                item.getProduto().getNome(),
                quantidade,
                precoUnitario,      // Preço de uma unidade
                totalItem           // Total do item no pedido
        );
    }
}
