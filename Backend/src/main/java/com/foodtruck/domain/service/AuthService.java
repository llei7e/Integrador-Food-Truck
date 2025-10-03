// src/main/java/com/foodtruck/domain/service/AuthService.java
package com.foodtruck.domain.service;

import com.foodtruck.api.dto.AuthDtos.*;
import com.foodtruck.entity.Role;
import com.foodtruck.entity.RoleName;
import com.foodtruck.entity.User;
import com.foodtruck.domain.repo.RoleRepository;
import com.foodtruck.domain.repo.UserRepository;
import com.foodtruck.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário já existe");
        }

        User u = new User();
        u.setName(req.name());
        u.setEmail(req.email());
        u.setPassword(encoder.encode(req.password()));

        // role default
        String roleStr = (req.role() == null || req.role().isBlank()) ? "USER" : req.role().toUpperCase();
        RoleName rn = RoleName.valueOf(roleStr.equals("ADMIN") ? "ROLE_ADMIN" : "ROLE_USER");
        Role role = roleRepo.findByName(rn)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Role não encontrada"));
        u.getRoles().add(role);

        userRepo.save(u);

        String token = jwtUtils.generateJwtTokenByUserId(u.getId()); // ou por email/username conforme sua implementação
        return new AuthResponse(token, "bearer",
                new UserView(u.getId(), u.getName(), u.getEmail(),
                        rn == RoleName.ROLE_ADMIN ? "admin" : "user"));
    }

    public AuthResponse login(LoginRequest req) {
        // autentica usando email como principal
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        // se você usa UserDetailsImpl, recupere o ID/email dali
        var principal = auth.getPrincipal(); // UserDetailsImpl
        Long userId;
        String name;
        String email;
        String roleStr = "user";

        if (principal instanceof com.foodtruck.security.UserDetailsImpl p) {
            userId = p.getId();
            name = p.getName();           
            email = p.getEmail();         
            roleStr = p.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? "admin" : "user";
        } else {
            // fallback buscando no repo
            var user = userRepo.findByEmail(req.email())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));
            userId = user.getId();
            name = user.getName();
            email = user.getEmail();
            roleStr = user.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_ADMIN")) ? "admin" : "user";
        }

        String token = jwtUtils.generateJwtTokenByUserId(userId);
        return new AuthResponse(token, "bearer", new UserView(userId, name, email, roleStr));
    }
}
