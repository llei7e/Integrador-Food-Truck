package com.foodtruck.api.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Controller usado para testar controle de acesso e permissões
@RestController
@RequestMapping("/api/test")
public class TestController {

    // Endpoint público, acessível sem autenticação
    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }
    
    // Endpoint acessível para usuários autenticados (USER ou ADMIN)
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public String userAccess() {
        return "User Content.";
    }
    
    // Endpoint restrito apenas para administradores
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAccess() {
        return "Admin Board.";
    }
}
