package com.foodtruck.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
// (Não precisa mais de SimpleGrantedAuthority ou Collectors)

import java.io.IOException;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService; // Você já tem este

    // O construtor está correto
    public AuthTokenFilter(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            String jwt = parseJwt(request);
            
            // 1. O token existe e é válido?
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                
                // 2. Pegue o 'subject' (que é o email) do token
                String email = jwtUtils.getSubjectFromJwtToken(jwt);

                // 3. SEMPRE carregue o usuário do banco.
                // Isso garante que o 'principal' é um UserDetailsImpl
                var userDetails = userDetailsService.loadUserByUsername(email); 
                
                // 4. Crie a autenticação
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, // <-- O 'principal' agora é o objeto UserDetailsImpl
                        null, 
                        userDetails.getAuthorities() // As roles vêm direto do UserDetails
                );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 5. Defina a autenticação no contexto do Spring
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication", e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}