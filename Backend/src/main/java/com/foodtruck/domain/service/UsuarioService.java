// src/main/java/com/foodtruck/domain/service/UsuarioService.java
package com.foodtruck.domain.service;

import com.foodtruck.domain.model.Usuario;
import com.foodtruck.domain.repo.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UsuarioService {

  private final UsuarioRepository repo;

  public Usuario criar(String name, String cargo) {
    Usuario u = new Usuario();
    u.setName(name);
    u.setCargo(cargo);
    return repo.save(u);
  }

  public List<Usuario> listar() {
    return repo.findAll();
  }

  public Optional<Usuario> buscar(Long id) {
    return repo.findById(id);
  }

  public boolean existe(Long id) {
    return repo.existsById(id);
  }

  public void deletar(Long id) {
    repo.deleteById(id);
  }

  public Optional<Usuario> atualizarParcial(Long id, Object dtoPatch) {
  // Esse método é só pra evitar erro se você colar errado.
  // Use o método de baixo com o tipo certo: UsuarioController.UsuarioPatchDto
  throw new UnsupportedOperationException();
}

public Optional<Usuario> atualizarParcial(Long id, com.foodtruck.api.controller.UsuarioController.UsuarioPatchDto dto) {
  return repo.findById(id).map(u -> {

    // Atualiza somente campos que vierem no PATCH
    if (StringUtils.hasText(dto.name())) {
      u.setName(dto.name().trim());
    }

    if (StringUtils.hasText(dto.cargo())) {
      u.setCargo(dto.cargo().trim());
    }

    if (dto.email() != null) {
      // email pode ser string vazia? aqui eu bloqueio vazio:
      if (!StringUtils.hasText(dto.email())) {
        throw new IllegalArgumentException("email não pode ser vazio");
      }
      u.setEmail(dto.email().trim());
    }

    return repo.save(u);
  });
}
}
