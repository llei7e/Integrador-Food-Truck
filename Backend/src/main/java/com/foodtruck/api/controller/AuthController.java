package com.foodtruck.api.controller;

import com.foodtruck.api.dto.AuthDtos.*;
import com.foodtruck.domain.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


// Controller responsável pelas rotas de autenticação da aplicação
@RestController
@RequestMapping("/api/auth/")
@RequiredArgsConstructor
public class AuthController {

    // Serviço que contém a lógica de autenticação (cadastro e login)
    private final AuthService authService;

    // Endpoint para cadastro de novos usuários
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest req) {
          // Chama o serviço para registrar o usuário e retorna a resposta de autenticação
        return ResponseEntity.ok(authService.register(req));
    }

    // Endpoint para login tradicional (email e senha)
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest req) {
        // Chama o serviço para autenticar o usuário
        return ResponseEntity.ok(authService.login(req));
    } 

    // Endpoint para login utilizando conta Google
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@RequestBody @Valid GoogleLoginRequest req) {
         // Autentica o usuário usando dados do Google
        return ResponseEntity.ok(authService.loginComGoogle(req));
}
}
