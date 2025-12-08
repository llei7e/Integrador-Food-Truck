package com.foodtruck.domain.service;

import com.foodtruck.api.dto.PedidosDto;
import com.foodtruck.domain.model.ItemPedido;
import com.foodtruck.domain.model.Pedido;
import com.foodtruck.domain.model.Produto;
import com.foodtruck.domain.repo.PedidoRepository;
import com.foodtruck.domain.repo.ProdutoRepository;
import com.foodtruck.security.UserDetailsImpl; 
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service 
@RequiredArgsConstructor
public class PedidoService {
    private final PedidoRepository pedidoRepo;
    private final ProdutoRepository produtoRepo;

    @Transactional
    public Pedido criar(PedidosDto.CriarPedidoRequest dto, UserDetailsImpl principal) {
        
        if (dto.itens() == null || dto.itens().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido sem itens");
        }

        // 1. Validar produtos
        List<Long> idsProdutos = dto.itens().stream().map(i -> i.produtoId()).toList();
        Map<Long, Produto> mapaProdutos = produtoRepo.findAllById(idsProdutos)
                .stream().collect(Collectors.toMap(Produto::getId, Function.identity()));

        if (mapaProdutos.size() != idsProdutos.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Um ou mais produtos não existem");
        }

        // 2. Criar e popular a entidade Pedido
        Pedido pedido = new Pedido();
        pedido.setUsuarioId(principal.getId());
        pedido.setTruckId(dto.truck_id());
        pedido.setStatus(dto.status());
        pedido.setMetodoPagamento(dto.metodoPagamento());

        // --- 4. LÓGICA DE CÁLCULO DE TOTAL (MUDADO PARA DOUBLE) ---
        double totalCalculado = 0.0; // Agora é double
        
        for (var itemDto : dto.itens()) {
            Produto prod = mapaProdutos.get(itemDto.produtoId());
            ItemPedido itemPedido = new ItemPedido();
            
            itemPedido.setProduto(prod);
            itemPedido.setQuantidade(itemDto.quantidade());
            
            // Assumindo que prod.getPreco() retorna o valor em centavos (Integer)
            // Converte o preço do produto para R$ (Double) antes de somar
            totalCalculado += prod.getPreco() * itemDto.quantidade();

            
            pedido.adicionarItem(itemPedido);
        }
        
        // 5. Salva o total calculado (Double) no pedido
        pedido.setTotal(totalCalculado); // <-- CORRIGIDO: setTotal agora recebe double/Double

        // 6. Salvar tudo
        return pedidoRepo.save(pedido);
    }

    public List<Pedido> listar() {
        return pedidoRepo.findAll();
    }

    @Transactional
    public void deletar(Long id) {
        if (!pedidoRepo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado");
        }
        pedidoRepo.deleteById(id);
    }

    public boolean existe(Long id) {
        return pedidoRepo.existsById(id);
    }

    @Transactional
    public Pedido atualizarStatus(Long id, String novoStatus) {
        Pedido pedido = pedidoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));

        pedido.setStatus(novoStatus);
        return pedidoRepo.save(pedido);
    }

}