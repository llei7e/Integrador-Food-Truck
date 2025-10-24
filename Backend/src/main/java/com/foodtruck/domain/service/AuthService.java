package com.foodtruck.domain.service;


import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;

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

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;


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

        var userDetails = com.foodtruck.security.UserDetailsImpl.build(u);
        String token = jwtUtils.generateJwtToken(userDetails); // <-- usa email no subject + claim "roles"
        return new AuthResponse(token, "bearer",
                new UserView(u.getId(), u.getName(), u.getEmail(),
                        (role.getName().name().equals("ROLE_ADMIN") ? "admin" : "user")));
    }

    public AuthResponse login(LoginRequest req) {
        // autentica usando email como principal
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password())
    );

    // pega o usuário autenticado
    var principal = (com.foodtruck.security.UserDetailsImpl) auth.getPrincipal();

    // gera token com email no subject e claim "roles"
    String token = jwtUtils.generateJwtToken(principal);

    Long userId = principal.getId();
    String name = principal.getName();
    String email = principal.getEmail();
    String roleStr = principal.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? "admin" : "user";

    return new AuthResponse(token, "bearer", new UserView(userId, name, email, roleStr));
}

public AuthResponse loginComGoogle(GoogleLoginRequest req) {
    var payload = verificarIdTokenGoogle(req.idToken()); // valida e devolve payload

    String email = payload.getEmail();
    String nome  = (String) payload.get("name"); // pode vir null
    String sub   = (String) payload.get("sub");  // Google user id

    // Carrega ou cria usuário local
    User u = userRepo.findByEmail(email).orElseGet(() -> {
        User novo = new User();
        novo.setName(nome != null ? nome : email);
        novo.setEmail(email);
        // senha dummy (não usada neste fluxo)
        novo.setPassword(encoder.encode("google-oauth2-" + sub));
        Role roleUser = roleRepo.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Role USER não encontrada"));
        novo.getRoles().add(roleUser);
        return userRepo.save(novo);
    });

    // Gera seu JWT (subject=email + roles)
    var principal = com.foodtruck.security.UserDetailsImpl.build(u);
    String token  = jwtUtils.generateJwtToken(principal);

    String roleStr = principal.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) ? "admin" : "user";

    return new AuthResponse(token, "bearer",
            new UserView(u.getId(), u.getName(), u.getEmail(), roleStr));
}

/** Valida o ID Token do Google e retorna o payload (email, name, sub, etc.) */
private GoogleIdToken.Payload verificarIdTokenGoogle(String idToken) {
    try {
        var http = GoogleNetHttpTransport.newTrustedTransport();
        var json = GsonFactory.getDefaultInstance();
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(http, json)
                .setAudience(java.util.Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idTok = verifier.verify(idToken);
        if (idTok == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ID Token inválido");
        return idTok.getPayload();
    } catch (ResponseStatusException e) {
        throw e;
    } catch (Exception e) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Falha ao validar ID Token do Google");
    }
}

}
