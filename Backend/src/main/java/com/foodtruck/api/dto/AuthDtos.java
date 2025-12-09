package com.foodtruck.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank String password,
            String role, // Mantemos por compatibilidade se quiser
            String cargo // <--- ADICIONADO: O AuthService precisa disso
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    // Alterado 'role' para 'cargo' para o JSON sair como { "cargo": "CHAPEIRO" }
    public record UserView(
            Long id, 
            String name, 
            String email, 
            String cargo 
    ) {}

    public record AuthResponse(String access_token, String token_type, UserView user) {}

    public record GoogleLoginRequest(@NotBlank String idToken) {}
}