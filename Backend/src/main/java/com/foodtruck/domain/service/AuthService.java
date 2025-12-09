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
import com.foodtruck.security.UserDetailsImpl;
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

        // --- DEFINIÇÃO DO CARGO ---
        // Se o front mandou "CHAPEIRO", salva "CHAPEIRO". Se mandou nada, salva "USUARIO".
        String cargoParaSalvar = (req.cargo() != null && !req.cargo().isBlank()) 
                ? req.cargo().toUpperCase() 
                : "USUARIO";
        
        u.setCargo(cargoParaSalvar);

        // Mantém a role técnica do Spring Security (apenas para não quebrar anotações @PreAuthorize internas)
        RoleName rn = "ADMIN".equals(cargoParaSalvar) ? RoleName.ROLE_ADMIN : RoleName.ROLE_USER;
        Role role = roleRepo.findByName(rn)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Role técnica não encontrada"));
        u.getRoles().add(role);

        userRepo.save(u);

        var userDetails = UserDetailsImpl.build(u);
        String token = jwtUtils.generateJwtToken(userDetails);
        
        // Retorna o cargo que acabamos de salvar
        return new AuthResponse(token, "bearer",
                new UserView(u.getId(), u.getName(), u.getEmail(), u.getCargo()));
    }

    public AuthResponse login(LoginRequest req) {
        // 1. Autentica
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        var principal = (UserDetailsImpl) auth.getPrincipal();
        String token = jwtUtils.generateJwtToken(principal);

        // 2. Busca o usuário fresco no banco para garantir que temos o CARGO atualizado
        User user = userRepo.findById(principal.getId()).orElseThrow();

        // 3. Lê direto do banco. Fallback para "USUARIO" se estiver nulo.
        String cargoReal = (user.getCargo() != null && !user.getCargo().isBlank()) 
                ? user.getCargo() 
                : "USUARIO";

        return new AuthResponse(token, "bearer", 
                new UserView(user.getId(), user.getName(), user.getEmail(), cargoReal));
    }

    public AuthResponse loginComGoogle(GoogleLoginRequest req) {
        var payload = verificarIdTokenGoogle(req.idToken());
        String email = payload.getEmail();
        String nome  = (String) payload.get("name");
        String sub   = (String) payload.get("sub");

        User u = userRepo.findByEmail(email).orElseGet(() -> {
            User novo = new User();
            novo.setName(nome != null ? nome : email);
            novo.setEmail(email);
            
            // Usuário Google nasce como USUARIO
            novo.setCargo("USUARIO");
            
            novo.setPassword(encoder.encode("google-oauth2-" + sub));
            Role roleUser = roleRepo.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Role USER não encontrada"));
            novo.getRoles().add(roleUser);
            return userRepo.save(novo);
        });

        var principal = UserDetailsImpl.build(u);
        String token  = jwtUtils.generateJwtToken(principal);

        // Retorna o cargo do banco
        String cargoReal = (u.getCargo() != null) ? u.getCargo() : "USUARIO";

        return new AuthResponse(token, "bearer",
                new UserView(u.getId(), u.getName(), u.getEmail(), cargoReal));
    }

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
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Falha ao validar ID Token do Google");
        }
    }
}