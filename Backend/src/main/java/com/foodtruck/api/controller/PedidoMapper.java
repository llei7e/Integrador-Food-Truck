package com.foodtruck.api.controller;

import com.foodtruck.api.dto.PedidosDto;
import com.foodtruck.domain.model.ItemPedido;
import com.foodtruck.domain.model.Pedido;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PedidoMapper {

    /**
     * Converte uma Entidade Pedido para um DTO PedidoView
     */
    public PedidosDto.PedidoView toPedidoView(Pedido pedido) {
        if (pedido == null) return null;

        var itensView = pedido.getItens().stream()
                .map(this::toItemPedidoView)
                .collect(Collectors.toList());

        return new PedidosDto.PedidoView(
                pedido.getId(),
                pedido.getStatus(),
                pedido.getTotal() / 100.0, // Converte centavos (Integer) de volta para Double
                pedido.getMetodoPagamento(),
                pedido.getDataCriacao(),
                pedido.getTruckId(), 
                itensView
        );
    }

    /**
     * Converte uma Entidade ItemPedido para um DTO ItemPedidoView
     */
    public PedidosDto.ItemPedidoView toItemPedidoView(ItemPedido item) {
        if (item == null) return null;

        // --- ALTERAÇÃO AQUI ---
        // Pega o preço da Entidade Produto (assumindo Integer em centavos)
        Integer precoUnitarioCentavos = item.getProduto().getPreco(); 
        Integer quantidade = item.getQuantidade();
        Integer totalItemCentavos = precoUnitarioCentavos * quantidade;
        
        return new PedidosDto.ItemPedidoView(
                item.getId(),
                item.getProduto().getId(),
                item.getProduto().getNome(), // Pega o nome do produto
                quantidade,
                precoUnitarioCentavos / 100.0, // Converte para Double (ex: 20.0)
                totalItemCentavos / 100.0 // Converte para Double (ex: 40.0)
        );
    }
}