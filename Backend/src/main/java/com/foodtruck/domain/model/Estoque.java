package com.foodtruck.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "estoque")
@Getter @Setter
public class Estoque {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produto_id", nullable = false)
  @com.fasterxml.jackson.annotation.JsonIgnore
  private Produto produto;

  @Column(nullable = false)
  private Integer quantidade; 

  @Column(length = 20)
  private String unidade; 
}
