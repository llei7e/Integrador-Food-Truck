// src/main/java/com/foodtruck/security/UserDetailsServiceImpl.java
package com.foodtruck.security;

import com.foodtruck.entity.User;
import com.foodtruck.domain.repo.UserRepository; // ajuste o pacote se o seu repo estiver em outro
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    // IMPORTANTE: aqui "username" é o EMAIL recebido no authenticate()
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository
                .findByEmail(username) // login por email
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        return UserDetailsImpl.build(user);
    }
}
