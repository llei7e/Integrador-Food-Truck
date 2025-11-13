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

  @Column(name = "truck_id", nullable = false)
  private Long truckId;

  @Column(nullable = false)
  private String status; // RECEBIDO/EM_PREPARO/...

  @Column(nullable = false) 
  private Integer total; // centavos

  @CreationTimestamp
  @Column(name = "data_criacao", updatable = false)
  private Instant dataCriacao;

  @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ItemPedido> itens = new ArrayList<>();
}
