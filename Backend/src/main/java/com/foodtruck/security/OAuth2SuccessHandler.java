package com.foodtruck.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodtruck.domain.repo.UserRepository;
import com.foodtruck.entity.RoleName;
import com.foodtruck.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepo;
    private final ObjectMapper mapper = new ObjectMapper(); // para escrever JSON

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("email");

            // Carrega usuário local e gera SEU JWT (mesma lógica do login normal)
            User user = userRepo.findByEmail(email).orElseThrow();
            var userDetails = UserDetailsImpl.build(user);
            String jwt = jwtUtils.generateJwtToken(userDetails);

            String role =
                    user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN)
                            ? "admin" : "user";

            Map<String, Object> body = new HashMap<>();
            body.put("access_token", jwt);
            body.put("token_type", "bearer");
            body.put("user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", role
            ));

            // Escreve JSON na resposta (sem redirecionar)
            response.setStatus(HttpServletResponse.SC_OK);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType("application/json");
            mapper.writeValue(response.getWriter(), body);

        } catch (Exception ex) {
            // Se algo falhar, retorne 500 com um JSON simples
            try {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.setContentType("application/json");
                mapper.writeValue(response.getWriter(),
                        Map.of("error", "Falha ao concluir login com Google"));
            } catch (Exception ignored) { }
        }
    }
}
