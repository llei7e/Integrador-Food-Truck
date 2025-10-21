// src/main/java/com/foodtruck/domain/repo/UsuarioRepository.java
package com.foodtruck.domain.repo;

import com.foodtruck.domain.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> { }
