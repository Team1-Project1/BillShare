package vn.backend.backend.service;

import vn.backend.backend.model.TokenEntity;

public interface TokenService {
    Long saveToken(TokenEntity token);
    String deleteToken(String email);
    TokenEntity findByEmail(String email);
}
