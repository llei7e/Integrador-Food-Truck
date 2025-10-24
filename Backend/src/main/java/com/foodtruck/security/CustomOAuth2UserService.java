package com.foodtruck.security;

import com.foodtruck.domain.repo.RoleRepository;
import com.foodtruck.domain.repo.UserRepository;
import com.foodtruck.entity.Role;
import com.foodtruck.entity.RoleName;
import com.foodtruck.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attrs = oAuth2User.getAttributes();

        // Atributos típicos do Google
        String email = (String) attrs.get("email");
        String name  = (String) attrs.getOrDefault("name", email);

        // Cria/atualiza usuário local
        User user = userRepo.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            u.setName(name);
            // senha aleatória só para cumprir a constraint; você não loga por senha nesse fluxo
            u.setPassword("{noop}oauth2-user"); 
            Role roleUser = roleRepo.findByName(RoleName.ROLE_USER)
                    .orElseGet(() -> roleRepo.save(new Role(RoleName.ROLE_USER)));
            u.getRoles().add(roleUser);
            return u;
        });
        if (!name.equals(user.getName())) {
            user.setName(name);
        }
        userRepo.save(user);

        // Retorna um principal OAuth2 padrão; “sub” é o identificador padrão do OpenID
        return new DefaultOAuth2User(
            List.of(new SimpleGrantedAuthority("ROLE_USER")),
            attrs,
            "sub" // atributo-chave
        );
    }
}