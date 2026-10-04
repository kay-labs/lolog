package com.lolog.dto.auth;

import lombok.Getter;

@Getter
public class LoginRequest {
    private String username;
    private String password;
}
