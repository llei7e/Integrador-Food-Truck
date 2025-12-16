package com.foodtruck.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// DTOs usados no processo de autenticação
public class AuthDtos {

    // DTO para cadastro de novos usuários
    public record RegisterRequest(
            @NotBlank String name,          // Nome do usuário
            @Email @NotBlank String email,  // Email válido
            @NotBlank String password,      // Senha do usuário
            String role,                    // Papel do usuário (opcional)
            String cargo                    // Cargo do usuário
    ) {}

    // DTO para login com email e senha
    public record LoginRequest(
            @Email @NotBlank String email,  // Email do usuário
            @NotBlank String password       // Senha do usuário
    ) {}

    // DTO para expor dados básicos do usuário autenticado
    public record UserView(
            Long id,        // ID do usuário
            String name,    // Nome
            String email,   // Email
            String cargo    // Cargo
    ) {}

    // DTO retornado após autenticação bem-sucedida
    public record AuthResponse(
            String access_token,  // Token de acesso JWT
            String token_type,    // Tipo do token (ex: Bearer)
            UserView user         // Dados do usuário logado
    ) {}

    // DTO para login utilizando autenticação do Google
    public record GoogleLoginRequest(
            @NotBlank String idToken // Token de autenticação do Google
    ) {}
}
