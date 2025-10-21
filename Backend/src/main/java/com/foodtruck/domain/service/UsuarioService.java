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

  public Usuario criar(String nome, String tipo) {
    Usuario u = new Usuario();
    u.setNome(nome);
    u.setTipo(tipo);
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
