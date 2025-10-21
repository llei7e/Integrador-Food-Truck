package com.foodtruck.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

// imports no topo:
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "item_pedido")
@Getter @Setter
public class ItemPedido {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @JsonIgnore
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "pedido_id", nullable = false)
  private Pedido pedido;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produto_id", nullable = false)
  private Produto produto;

  @Column(nullable = false)
  private Integer quantidade = 1;
}
