package com.foodtruck.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedido")
@Getter @Setter
public class Pedido {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    // --- NOVO CAMPO (do DTO) ---
    @Column(name = "truck_id", nullable = false)
    private Long truckId;
    
    // --- NOVO CAMPO (do DTO) ---
    @Column(name = "metodo_pagamento", nullable = false)
    private String metodoPagamento;

    @Column(nullable = false)
    private String status; // na fila / cozinhando / finalizado

    @Column(nullable = false) 
    private Integer total; // Em centavos

    @CreationTimestamp
    @Column(name = "data_criacao", updatable = false)
    private Instant dataCriacao;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> itens = new ArrayList<>();

    // Helper para adicionar itens
    public void adicionarItem(ItemPedido item) {
        itens.add(item);
        item.setPedido(this);
    }
}
