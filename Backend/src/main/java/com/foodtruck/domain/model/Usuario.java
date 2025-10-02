// src/main/java/com/foodtruck/domain/model/Usuario.java
package com.foodtruck.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "usuario")
@Getter @Setter
public class Usuario {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String nome;

  @Column(nullable = false, length = 40)
  private String tipo; // ex.: "cliente", "dono", "admin" — fica a seu critério

  @CreationTimestamp
  @Column(name = "data_criacao", updatable = false)
  private Instant dataCriacao;
}
