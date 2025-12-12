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

            // Tenta pegar o redirect enviado pelo front
            String frontendRedirect = request.getParameter("redirect");
            
            // O Spring Security LIMPA os parâmetros no callback do Google.
            // Como não temos Cookie Repository, isso vai vir NULO.
            // Usamos um fallback fixo para garantir que funcione no seu ambiente de teste.
            if (frontendRedirect == null || frontendRedirect.isBlank()) {
                // Ajuste esta URL para onde seu Frontend está rodando (Web ou Deep Link Mobile)
                frontendRedirect = "http://localhost:8081/oauth-google"; 
            }

            // Carrega usuário do banco (já salvo pelo CustomOAuth2UserService)
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

            // Monta o JSON de resposta
            Map<String, Object> body = new HashMap<>();
            body.put("access_token", jwt);
            body.put("token_type", "bearer");
            
            body.put("user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "cargo", cargo // Envia o valor puro do banco para o front
            ));

            String json = mapper.writeValueAsString(body);

            // Redireciona de volta para o frontend com o payload na URL
            String redirectUrl = frontendRedirect
                    + (frontendRedirect.contains("?") ? "&" : "?")
                    + "payload=" + URLEncoder.encode(json, StandardCharsets.UTF_8);

            response.sendRedirect(redirectUrl);

        } catch (Exception ex) {
            try {
                // Em caso de erro, tenta retornar JSON ou logar
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                // response.getWriter().write(...) // Opcional
            } catch (Exception ignored) {}
        }
    }
}