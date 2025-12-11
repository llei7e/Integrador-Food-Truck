// src/main/java/com/foodtruck/api/controller/AuthController.java
package com.foodtruck.api.controller;

import com.foodtruck.api.dto.AuthDtos.*;
import com.foodtruck.domain.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    } 

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@RequestBody @Valid GoogleLoginRequest req) {
        return ResponseEntity.ok(authService.loginComGoogle(req));
}
}
