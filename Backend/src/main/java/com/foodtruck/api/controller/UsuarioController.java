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

// Controller responsável pelo gerenciamento de usuários
@RestController
@RequestMapping({"/api/usuarios"}) 
@RequiredArgsConstructor
@Validated
public class UsuarioController {

  // Serviço que contém a lógica de negócio dos usuários
  private final UsuarioService service;

  // DTO usado para criação de usuários
  public record UsuarioCreateDto(
      @NotBlank String name,   // Nome do usuário
      @NotBlank String cargo   // Cargo ou função do usuário
  ) {}

  // Endpoint para criar um novo usuário
  @PostMapping
  public ResponseEntity<Usuario> criar(@RequestBody @Valid UsuarioCreateDto dto) {
    // Cria o usuário com base nos dados recebidos
    Usuario u = service.criar(dto.name(), dto.cargo());
    return ResponseEntity.status(HttpStatus.CREATED).body(u);
  }

  // Endpoint para listar todos os usuários
  @GetMapping
  public List<Usuario> listar() {
    // Retorna todos os usuários cadastrados
    return service.listar();
  }

  // Endpoint para buscar um usuário pelo ID
  @GetMapping("/{id}")
  public ResponseEntity<Usuario> buscar(@PathVariable Long id) {
    // Retorna o usuário se existir ou 404 se não existir
    return service.buscar(id)
                  .map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
  }

  // Endpoint para remover um usuário pelo ID
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletar(@PathVariable Long id) {
    // Verifica se o usuário existe antes de excluir
    if (!service.existe(id)) {
      return ResponseEntity.notFound().build();
    }

    service.deletar(id);
    return ResponseEntity.noContent().build(); 
  }
}
