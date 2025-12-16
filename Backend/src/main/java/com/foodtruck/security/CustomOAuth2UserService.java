package com.foodtruck.security;

import com.foodtruck.domain.repo.RoleRepository;
import com.foodtruck.domain.repo.UserRepository;
import com.foodtruck.entity.Role;
import com.foodtruck.entity.RoleName;
import com.foodtruck.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String email = (String) attrs.get("email");
        String name  = (String) attrs.getOrDefault("name", email);

        // 1. Carrega ou Cria o usuário
        User user = userRepo.findByEmail(email).orElseGet(() -> {
            // Se não existe, cria novo
            User u = new User();
            u.setEmail(email);
            u.setName(name);
            u.setPassword("{noop}oauth2-user");
            
            // --- A CORREÇÃO ESTÁ AQUI ---
            // Estava faltando dizer que ele é USUARIO no banco
            u.setCargo("USUARIO"); 
            // ----------------------------
            
            Role roleUser = roleRepo.findByName(RoleName.ROLE_USER)
                    .orElseGet(() -> roleRepo.save(new Role(RoleName.ROLE_USER)));
            
            u.getRoles().add(roleUser);
            return userRepo.save(u);
        });

        // Atualiza nome se mudou no Google
        if (!name.equals(user.getName())) {
            user.setName(name);
            userRepo.save(user);
        }
        
        // Garante fallback caso o usuário antigo tenha cargo NULL
        if (user.getCargo() == null) {
             user.setCargo("USUARIO");
             userRepo.save(user);
        }

        // 2. Converte roles para o Spring Security
        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toSet());

        return new DefaultOAuth2User(
                authorities,
                attrs,
                "sub"
        );
    }
}