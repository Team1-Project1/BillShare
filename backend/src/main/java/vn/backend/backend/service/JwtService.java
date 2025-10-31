package vn.backend.backend.service;

import org.springframework.security.core.userdetails.UserDetails;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.FriendClaimsRequest;

import java.util.Map;

public interface JwtService {
    String generateAccessToken(UserDetails userDetails);
    String generateRefreshToken(UserDetails user);
    String extractEmail(String token, TokenType type);
    Boolean isValid(String token, UserDetails userDetails, TokenType type);
    Long extractUserId(String token, TokenType type);
    String generateFriendRequestToken(Long senderId, Long receiverId);
    String generateOtpToken(String email);
    FriendClaimsRequest decodeFriendRequestToken(String token);
}
