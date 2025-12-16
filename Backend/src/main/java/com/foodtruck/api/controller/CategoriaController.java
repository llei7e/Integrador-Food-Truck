
package com.foodtruck.api.controller;
import java.util.List;


import com.foodtruck.domain.model.Categoria;
import com.foodtruck.domain.repo.CategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


// Controller responsável pelo gerenciamento de categorias
@RestController
@RequestMapping({"/api/categoria"})


public class CategoriaController {

  // Repositório usado para acessar o banco de dados de categorias
  private final CategoriaRepository repo;
   // Injeção do repositório via construtor
  public CategoriaController(CategoriaRepository repo) { this.repo = repo; }

  // Endpoint para criar uma nova categoria
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Categoria criar(@RequestBody Categoria c) {
    // Salva a categoria no banco e retorna o registro criado
    return repo.save(c);
  }

  // Endpoint para listar todas as categorias
  @GetMapping
  public List<Categoria> listar() {
    // Busca e retorna todas as categorias cadastradas
    return repo.findAll();
  }

}
