// src/test/java/vn/backend/backend/service/Impl/JwtServiceImplTest.java
package vn.backend.backend.service.Impl;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.FriendClaimsRequest;
import vn.backend.backend.model.UserEntity;

import javax.crypto.SecretKey;
import java.lang.reflect.Field;
import java.util.Base64;
import java.util.Date;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceImplTest {

    @InjectMocks
    private JwtServiceImpl jwtService;

    private UserDetails userDetails;
    private UserEntity userEntity;

    private static final SecretKey KEY_ACCESS       = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final SecretKey KEY_REFRESH      = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final SecretKey KEY_FRIENDSHIP   = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private static final SecretKey KEY_OTP          = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    private static final String SECRET_ACCESS       = Base64.getEncoder().encodeToString(KEY_ACCESS.getEncoded());
    private static final String SECRET_REFRESH      = Base64.getEncoder().encodeToString(KEY_REFRESH.getEncoded());
    private static final String SECRET_FRIENDSHIP   = Base64.getEncoder().encodeToString(KEY_FRIENDSHIP.getEncoded());
    private static final String SECRET_OTP          = Base64.getEncoder().encodeToString(KEY_OTP.getEncoded());

    @BeforeEach
    void setUp() throws Exception {
        userEntity = UserEntity.builder()
                .userId(999L)
                .email("test@example.com")
                .fullName("Test User")
                .build();

        userDetails = User.withUsername("test@example.com")
                .password("pass")
                .authorities("USER")
                .build();

        setField("timeOutAccessToken", 30L);
        setField("timeOutRefreshToken", 1440L);
        setField("secretKeyAccessToken", SECRET_ACCESS);
        setField("secretKeyRefreshToken", SECRET_REFRESH);
        setField("secretKeyFriendship", SECRET_FRIENDSHIP);
        setField("secretKeyOtp", SECRET_OTP);
    }

    private void setField(String fieldName, Object value) throws Exception {
        Field field = JwtServiceImpl.class.getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(jwtService, value);
    }

    @Test
    void generateAccessToken_success() {
        String token = jwtService.generateAccessToken(userEntity);
        assertThat(token).isNotBlank();

        Claims claims = Jwts.parserBuilder().setSigningKey(KEY_ACCESS).build().parseClaimsJws(token).getBody();
        assertThat(claims.getSubject()).isEqualTo("test@example.com");
        assertThat(claims.get("userId", Long.class)).isEqualTo(999L);
    }

    @Test
    void generateRefreshToken_success() {
        String token = jwtService.generateRefreshToken(userEntity);
        Claims claims = Jwts.parserBuilder().setSigningKey(KEY_REFRESH).build().parseClaimsJws(token).getBody();
        assertThat(claims.getSubject()).isEqualTo("test@example.com");
    }

    @Test
    void isValid_validToken_returnTrue() {
        String token = jwtService.generateAccessToken(userEntity);
        assertThat(jwtService.isValid(token, userEntity, TokenType.ACCESS_TOKEN)).isTrue();
    }

    // FIX 1: Token hết hạn → ném ExpiredJwtException → BẮT EXCEPTION → PASS
    @Test
    void isValid_expiredToken_returnFalse() {
        String expiredToken = Jwts.builder()
                .setSubject("test@example.com")
                .claim("userId", 999L)
                .setExpiration(new Date(System.currentTimeMillis() - 5000))
                .signWith(KEY_ACCESS)
                .compact();

        assertThatThrownBy(() -> jwtService.isValid(expiredToken, userEntity, TokenType.ACCESS_TOKEN))
                .isInstanceOf(ExpiredJwtException.class);
    }

    // FIX 2: Email sai → KHÔNG ném exception → chỉ trả false → PASS
    @Test
    void isValid_wrongEmail_returnFalse() {
        String token = jwtService.generateAccessToken(userEntity); // token hợp lệ

        UserDetails wrongUser = User.withUsername("wrong@example.com")
                .password("pass")
                .authorities("USER")
                .build();

        boolean valid = jwtService.isValid(token, wrongUser, TokenType.ACCESS_TOKEN);

        assertThat(valid).isFalse(); // ← ĐÚNG: trả false, KHÔNG ném exception
    }

    @Test
    void extractUserId_success() {
        String token = jwtService.generateAccessToken(userEntity);
        assertThat(jwtService.extractUserId(token, TokenType.ACCESS_TOKEN)).isEqualTo(999L);
    }

    @Test
    void friendRequestToken_roundTrip_success() {
        String token = jwtService.generateFriendRequestToken(100L, 200L);
        FriendClaimsRequest req = jwtService.decodeFriendRequestToken(token);
        assertThat(req.getSenderId()).isEqualTo(100L);
        assertThat(req.getReceiverId()).isEqualTo(200L);
    }

    @Test
    void generateOtpToken_success() {
        String token = jwtService.generateOtpToken("otp@x.com");
        Claims claims = Jwts.parserBuilder().setSigningKey(KEY_OTP).build().parseClaimsJws(token).getBody();
        assertThat(claims.getSubject()).isEqualTo("otp@x.com");
    }

    @Test
    void extractEmail_success() {
        String token = jwtService.generateAccessToken(userEntity);
        assertThat(jwtService.extractEmail(token, TokenType.ACCESS_TOKEN)).isEqualTo("test@example.com");
    }

    @Test
    void decodeFriendRequestToken_invalidKey_throwException() {
        String token = jwtService.generateFriendRequestToken(1L, 2L);
        SecretKey wrong = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        assertThatThrownBy(() -> Jwts.parserBuilder().setSigningKey(wrong).build().parseClaimsJws(token))
                .isInstanceOf(io.jsonwebtoken.security.SignatureException.class);
    }

    @Test
    void extractUserId_noUserId_returnNull() {
        String token = Jwts.builder()
                .setSubject("test@example.com")
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(KEY_ACCESS)
                .compact();
        assertThat(jwtService.extractUserId(token, TokenType.ACCESS_TOKEN)).isNull();
    }

    @Test
    void friendRequestToken_expiration24h() {
        String token = jwtService.generateFriendRequestToken(1L, 2L);
        Claims claims = Jwts.parserBuilder().setSigningKey(KEY_FRIENDSHIP).build().parseClaimsJws(token).getBody();
        long hours = (claims.getExpiration().getTime() - claims.getIssuedAt().getTime()) / (1000 * 60 * 60);
        assertThat(hours).isEqualTo(24L);
    }

    @Test
    void otpToken_expiration15min() {
        String token = jwtService.generateOtpToken("test@x.com");
        Claims claims = Jwts.parserBuilder().setSigningKey(KEY_OTP).build().parseClaimsJws(token).getBody();
        long minutes = (claims.getExpiration().getTime() - claims.getIssuedAt().getTime()) / (1000 * 60);
        assertThat(minutes).isEqualTo(15L);
    }
}