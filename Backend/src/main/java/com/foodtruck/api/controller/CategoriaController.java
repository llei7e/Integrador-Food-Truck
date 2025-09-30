// src/main/java/com/foodtruck/api/controller/CategoriaController.java
package com.foodtruck.api.controller;
import org.springframework.http.ResponseEntity;
import java.util.List;


import com.foodtruck.domain.model.Categoria;
import com.foodtruck.domain.repo.CategoriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/categoria"})
public class CategoriaController {
  private final CategoriaRepository repo;
  public CategoriaController(CategoriaRepository repo) { this.repo = repo; }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Categoria criar(@RequestBody Categoria c) {
    return repo.save(c);
  }

  @GetMapping
  public List<Categoria> listar() {
    return repo.findAll();
  }

}
