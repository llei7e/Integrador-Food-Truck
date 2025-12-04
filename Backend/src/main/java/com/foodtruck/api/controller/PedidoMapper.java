package com.foodtruck.api.controller;

import com.foodtruck.api.dto.PedidosDto;
import com.foodtruck.domain.model.ItemPedido;
import com.foodtruck.domain.model.Pedido;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PedidoMapper {

    public PedidosDto.PedidoView toPedidoView(Pedido pedido) {
        if (pedido == null) return null;

        var itensView = pedido.getItens().stream()
                .map(this::toItemPedidoView)
                .collect(Collectors.toList());

        return new PedidosDto.PedidoView(
                pedido.getId(),
                pedido.getStatus(),
                pedido.getTotal(),              // 👈 NÃO divide por 100
                pedido.getMetodoPagamento(),
                pedido.getDataCriacao(),
                pedido.getTruckId(),
                itensView
        );
    }

    public PedidosDto.ItemPedidoView toItemPedidoView(ItemPedido item) {
        if (item == null) return null;

        var precoUnitario = item.getProduto().getPreco(); 
        var quantidade = item.getQuantidade();

        // Se preço já está tratado no Produto (ex: 10.10), não mexer:
        var totalItem = precoUnitario * quantidade;

        return new PedidosDto.ItemPedidoView(
                item.getId(),
                item.getProduto().getId(),
                item.getProduto().getNome(),
                quantidade,
                precoUnitario,      // 👈 sem dividir
                totalItem           // 👈 sem dividir
        );
    }
}
