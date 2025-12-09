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

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;

    @Override
    @Transactional // Importante para carregar as roles (Lazy loading)
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String email = (String) attrs.get("email");
        String name  = (String) attrs.getOrDefault("name", email);

        // 1. Carrega ou Cria o usuário
        User user = userRepo.findByEmail(email).orElseGet(() -> {
            // Se não existe, cria novo como CLIENTE (USER)
            User u = new User();
            u.setEmail(email);
            u.setName(name);
            u.setPassword("{noop}oauth2-user");
            
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

        // 2. CONVERTE AS ROLES DO BANCO PARA O SPRING SECURITY
        // Aqui está a correção: pegamos o que está no banco (user.getRoles)
        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toSet());

        // 3. Retorna o usuário com as permissões corretas
        return new DefaultOAuth2User(
                authorities, // <-- Passa as roles dinâmicas aqui
                attrs,
                "sub"
        );
    }
}