// src/main/java/com/foodtruck/api/controller/UsuarioController.java
package com.foodtruck.api.controller;

import com.foodtruck.domain.model.Usuario;
import com.foodtruck.domain.service.UsuarioService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/usuarios"}) // aceita plural e singular
@RequiredArgsConstructor
@Validated
public class UsuarioController {

  private final UsuarioService service;

  // DTO de criação
  public record UsuarioCreateDto(
      @NotBlank String nome,
      @NotBlank String tipo
  ) {}

  // POST /api/usuarios
  @PostMapping
  public ResponseEntity<Usuario> criar(@RequestBody @Valid UsuarioCreateDto dto) {
    Usuario u = service.criar(dto.nome(), dto.tipo());
    return ResponseEntity.status(HttpStatus.CREATED).body(u);
  }

  // GET /api/usuarios
  @GetMapping
  public List<Usuario> listar() {
    return service.listar();
  }

  // GET /api/usuarios/{id}
  @GetMapping("/{id}")
  public ResponseEntity<Usuario> buscar(@PathVariable Long id) {
    return service.buscar(id)
                  .map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
  }

  // DELETE /api/usuarios/{id}
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletar(@PathVariable Long id) {
    if (!service.existe(id)) return ResponseEntity.notFound().build();
    service.deletar(id);
    return ResponseEntity.noContent().build(); // 204
  }
}
