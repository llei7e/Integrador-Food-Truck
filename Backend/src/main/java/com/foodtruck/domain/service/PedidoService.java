package com.foodtruck.domain.service;

import com.foodtruck.api.dto.PedidosDto; // --- 1. Importar o DTO correto ---
import com.foodtruck.domain.model.ItemPedido;
import com.foodtruck.domain.model.Pedido;
import com.foodtruck.domain.model.Produto;
import com.foodtruck.domain.repo.PedidoRepository;
import com.foodtruck.domain.repo.ProdutoRepository;
import com.foodtruck.security.UserDetailsImpl; // --- 2. Importar UserDetails ---
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
    // O record 'Item' interno não é mais necessário

    @Transactional
    // --- 3. Assinatura do método ATUALIZADA ---
    public Pedido criar(PedidosDto.CriarPedidoRequest dto, UserDetailsImpl principal) {
        
        if (dto.itens() == null || dto.itens().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pedido sem itens");
        }

        // 1. Validar produtos (Lógica existente)
        List<Long> idsProdutos = dto.itens().stream().map(i -> i.produtoId()).toList();
        Map<Long, Produto> mapaProdutos = produtoRepo.findAllById(idsProdutos)
                .stream().collect(Collectors.toMap(Produto::getId, Function.identity()));

        if (mapaProdutos.size() != idsProdutos.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Um ou mais produtos não existem");
        }

        // 2. Criar e popular a entidade Pedido
        Pedido pedido = new Pedido();
        pedido.setUsuarioId(principal.getId()); // Pega o ID do usuário logado
        pedido.setTruckId(dto.truck_id());
        pedido.setStatus(dto.status()); // "na fila"
        pedido.setMetodoPagamento(dto.metodoPagamento());

        // --- 4. LÓGICA DE CÁLCULO DE TOTAL ---
        int totalCalculadoEmCentavos = 0; 
        
        for (var itemDto : dto.itens()) {
            Produto prod = mapaProdutos.get(itemDto.produtoId());
            ItemPedido itemPedido = new ItemPedido();
            
            itemPedido.setProduto(prod);
            itemPedido.setQuantidade(itemDto.quantidade());
            
            // O 'precoUnitario' não é mais salvo, usamos o do Produto
            
            // Assumindo que prod.getPreco() retorna um Integer em centavos
            // (Se prod.getPreco() for Double, use: (int) (prod.getPreco() * 100))
            totalCalculadoEmCentavos += prod.getPreco() * itemDto.quantidade();
            
            pedido.adicionarItem(itemPedido); // Helper para definir pedido.setItens e item.setPedido
        }
        
        // 5. Salva o total calculado no backend
        pedido.setTotal(totalCalculadoEmCentavos);

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
    
    // O record 'Item' interno foi removido
}