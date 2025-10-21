package com.foodtruck.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Categoria")
@Getter @Setter
public class Categoria {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String nome;

  private String descricao;

  private Boolean ativo = true;
}

