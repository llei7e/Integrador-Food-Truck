package com.foodtruck.domain.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "produto")
@Getter
@Setter
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String descricao;

    @Column(nullable = false)
    private Double preco; // centavos

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    @JsonIgnore // evita serializar o objeto Categoria inteiro
    private Categoria categoria;

    private Boolean ativo = true;

    // 👇 Getter adicional para expor apenas o ID da categoria no JSON
    @JsonProperty("categoriaId")
    public Long getCategoriaId() {
        return categoria != null ? categoria.getId() : null;
    }
}