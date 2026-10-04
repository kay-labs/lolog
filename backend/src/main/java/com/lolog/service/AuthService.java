package com.lolog.service;

import com.lolog.domain.User;
import com.lolog.dto.auth.LoginRequest;
import com.lolog.dto.auth.LoginResponse;
import com.lolog.repository.UserRepository;
import com.lolog.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtTokenProvider.createToken(user.getUsername(), user.getRole().name());
        return new LoginResponse(token, user.getUsername());
    }
}
