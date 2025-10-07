package vn.backend.backend.service;

import org.springframework.security.core.userdetails.UserDetails;
import vn.backend.backend.common.TokenType;

public interface JwtService {
    String generateAccessToken(UserDetails userDetails);
    String generateRefreshToken(UserDetails user);
    String extractEmail(String token, TokenType type);
    Boolean isValid(String token, UserDetails userDetails, TokenType type);
    Long extractUserId(String token, TokenType type);
}
