package com.foodtruck.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodtruck.domain.repo.UserRepository;
import com.foodtruck.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepo;
    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("email");

            String frontendRedirect = request.getParameter("redirect");
            if (frontendRedirect == null || frontendRedirect.isBlank()) {
                frontendRedirect = "http://localhost:8081/oauth-google";
            }

            // Carrega usuário do banco
            User user = userRepo.findByEmail(email).orElseThrow();
            var userDetails = UserDetailsImpl.build(user);
            String jwt = jwtUtils.generateJwtToken(userDetails);

            // --- LÓGICA DIRETA DO BANCO ---
            // Lê exatamente o que está escrito na coluna 'cargo'
            String cargo = user.getCargo();
            
            // Fallback apenas se estiver nulo no banco
            if (cargo == null || cargo.isBlank()) {
                cargo = "USUARIO";
            }
            // -----------------------------

            Map<String, Object> body = new HashMap<>();
            body.put("access_token", jwt);
            body.put("token_type", "bearer");
            
            body.put("user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "cargo", cargo // Envia o valor puro do banco
            ));

            String json = mapper.writeValueAsString(body);

            String redirectUrl = frontendRedirect
                    + (frontendRedirect.contains("?") ? "&" : "?")
                    + "payload=" + URLEncoder.encode(json, StandardCharsets.UTF_8);

            response.sendRedirect(redirectUrl);

        } catch (Exception ex) {
            try {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.setContentType("application/json");
                mapper.writeValue(response.getWriter(),
                        Map.of("error", "Falha ao concluir login com Google: " + ex.getMessage()));
            } catch (Exception ignored) {}
        }
    }
}