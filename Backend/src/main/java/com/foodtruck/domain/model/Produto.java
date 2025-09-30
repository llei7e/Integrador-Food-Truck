package com.foodtruck.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "produto")
@Getter @Setter
public class Produto {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String nome;

  private String descricao;

  @Column(nullable = false)
  private Integer preco; // centavos

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "categoria_id", nullable = false)
  @com.fasterxml.jackson.annotation.JsonIgnore
  private Categoria categoria;   // <-- nome de campo em minúsculas


  private Boolean ativo = true;
}
