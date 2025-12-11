// src/main/java/com/foodtruck/domain/service/UsuarioService.java
package com.foodtruck.domain.service;

import com.foodtruck.domain.model.Usuario;
import com.foodtruck.domain.repo.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
}
