package com.foodtruck.domain.service;

import com.foodtruck.domain.model.ItemPedido;
import com.foodtruck.domain.model.Pedido;
import com.foodtruck.domain.model.Produto;
import com.foodtruck.domain.repo.PedidoRepository;
import com.foodtruck.domain.repo.ProdutoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class PedidoService {
  private final PedidoRepository pedidoRepo;
  private final ProdutoRepository produtoRepo;

  @Transactional
  public Pedido criar(Long usuarioId, Long foodtruckId, List<Item> itens) {
    if (itens == null || itens.isEmpty()) throw new IllegalArgumentException("Pedido sem itens");

    List<Long> idsProdutos = itens.stream().map(i -> i.produtoId).toList();
    Map<Long, Produto> mapa = produtoRepo.findAllById(idsProdutos)
        .stream().collect(Collectors.toMap(Produto::getId, Function.identity()));

    if (mapa.size() != idsProdutos.size())
      throw new IllegalArgumentException("Produto inexistente em um dos itens");

    Pedido pedido = new Pedido();
    pedido.setUsuarioId(usuarioId);
    pedido.setFoodtruckId(foodtruckId);
    pedido.setStatus("RECEBIDO");
    pedido.setTotal(0);

    List<ItemPedido> itensEnt = new ArrayList<>();
    int total = 0;
    for (Item it : itens) {
      Produto prod = mapa.get(it.produtoId);
      ItemPedido ip = new ItemPedido();
      ip.setPedido(pedido);
      ip.setProduto(prod);
      ip.setQuantidade(it.quantidade);
      itensEnt.add(ip);
      total += prod.getPreco() * it.quantidade;
    }
    pedido.setItens(itensEnt);
    pedido.setTotal(total);

    return pedidoRepo.save(pedido);
  }

  public Optional<Pedido> buscar(Long id) {
    return pedidoRepo.findById(id);
  }

  // DTO interno simples para service
  public record Item(Long produtoId, Integer quantidade) {}
}
