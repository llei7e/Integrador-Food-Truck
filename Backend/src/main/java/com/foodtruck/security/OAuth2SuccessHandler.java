package com.foodtruck.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodtruck.domain.repo.UserRepository;
import com.foodtruck.entity.User;
import jakarta.servlet.http.Cookie;
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
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepo;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpCookieOAuth2AuthorizationRequestRepository cookieAuthorizationRequestRepository;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {

        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = (String) oAuth2User.getAttributes().get("email");

            // 1. TENTA PEGAR A URL DE VOLTA DO COOKIE (QUE O MOBILE MANDOU)
            String targetUrl = getRedirectUriFromCookie(request);

            // 2. FALLBACK: Se não tiver cookie, usa o padrão Web (nip.io)
            if (targetUrl == null || targetUrl.isBlank()) {
                targetUrl = "http://54.146.16.231.nip.io:8081/oauth-google";
            }

            // 3. Gera o Token e Dados
            User user = userRepo.findByEmail(email).orElseThrow();
            var userDetails = UserDetailsImpl.build(user);
            String jwt = jwtUtils.generateJwtToken(userDetails);

            String cargo = user.getCargo();
            if (cargo == null || cargo.isBlank()) cargo = "USUARIO";

            Map<String, Object> body = new HashMap<>();
            body.put("access_token", jwt);
            body.put("token_type", "bearer");
            body.put("user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "cargo", cargo
            ));

            String json = mapper.writeValueAsString(body);

            // 4. Monta a URL final com o payload
            String finalRedirectUrl = targetUrl
                    + (targetUrl.contains("?") ? "&" : "?")
                    + "payload=" + URLEncoder.encode(json, StandardCharsets.UTF_8);

            // 5. LIMPA OS COOKIES DE AUTH (Importante para não acumular lixo)
            cookieAuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

            // 6. Redireciona
            if (!response.isCommitted()) {
                response.sendRedirect(finalRedirectUrl);
            }

        } catch (Exception ex) {
            ex.printStackTrace();
            try {
                if (!response.isCommitted()) {
                    response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Erro no login social");
                }
            } catch (Exception ignored) {}
        }
    }

    // Helper para ler o cookie específico "redirect_uri"
    private String getRedirectUriFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("redirect_uri".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}