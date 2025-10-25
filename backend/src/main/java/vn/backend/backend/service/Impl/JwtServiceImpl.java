package vn.backend.backend.service.Impl;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.FriendClaimsRequest;
import vn.backend.backend.service.JwtService;
import vn.backend.backend.model.UserEntity;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import static vn.backend.backend.common.TokenType.ACCESS_TOKEN;
import static vn.backend.backend.common.TokenType.REFRESH_TOKEN;

@Service
public class JwtServiceImpl implements JwtService {
    @Value("${jwt.timeOutAccessToken}")
    private Long timeOutAccessToken;
    @Value("${jwt.timeOutRefreshToken}")
    private Long timeOutRefreshToken;
    @Value("${jwt.secretKeyAccessToken}")
    private String secretKeyAccessToken;
    @Value("${jwt.secretKeyRefreshToken}")
    private String secretKeyRefreshToken;
    @Value("${jwt.secretKeyFriendship}")
    private String secretKeyFriendship;


    @Override
    public String generateAccessToken(UserDetails userDetails) {
        return generateTokenString(new HashMap<>(), userDetails);
    }
    // Sinh ra JWT Access Token:
    // - claims: chứa thêm các thông tin tuỳ ý (ở đây truyền rỗng)
    // - subject: định danh chính (ở đây dùng email)
    // - issuedAt: thời điểm phát hành token
    // - expiration: thời điểm hết hạn
    // - signWith : kí token = key
    private String generateTokenString(Map<String, Object> claims,UserDetails userDetails) {
        //them userid
        if (userDetails instanceof UserEntity user) {
            claims.put("userId", user.getUserId());
        }

        return Jwts.builder().
                setClaims(claims).
                setSubject(userDetails.getUsername()).
                setIssuedAt(new Date(System.currentTimeMillis())).
                setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * timeOutAccessToken)).
                signWith(SignatureAlgorithm.HS256, secretKeyAccessToken).
                compact();
    }

    @Override
    public String generateRefreshToken(UserDetails userDetails) {
        return generateRefreshToken(new HashMap<>(), userDetails);
    }
    private String generateRefreshToken(Map<String, Object> claims,UserDetails user) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis()+1000*60*timeOutRefreshToken))
                .signWith(getkey(REFRESH_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }
    // Giải mã chuỗi secretKey(Base64) thành mảng byte
    //Tạo đối tượng Key sử dụng thuật toán HMAC-SHA với mảng byte vừa decode
    private Key getkey(TokenType type){
        byte[] keyBytes;
        if (ACCESS_TOKEN.equals(type)) {
            keyBytes = Decoders.BASE64.decode(secretKeyAccessToken);
        }else if(REFRESH_TOKEN.equals(type)){
            keyBytes = Decoders.BASE64.decode(secretKeyRefreshToken);
        }else{
            keyBytes = Decoders.BASE64.decode(secretKeyFriendship);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }


    @Override
    public Boolean isValid(String token, UserDetails userDetails, TokenType type) {
        final String email=extractEmail(token,type);
        return (email.equals(userDetails.getUsername())&&!isTokenExpired(token,type));
    }
    // Lấy email được lưu trong token
    @Override
    public String extractEmail(String token, TokenType type) {
        return extractClaim(token, Claims::getSubject,type);
    }
    // Lấy thời gian hết hạn của token
    private Date extractExpiration(String token,TokenType type ) {
        return extractClaim(token,Claims::getExpiration,type);
    }
    // Hàm generic: lấy ra claim bất kỳ trong JWT
    // claimsResolver chính là function như Claims::getSubject, Claims::getExpiration
    private <T>T extractClaim(String token, Function<Claims, T> claimsResolver, TokenType type) {
        final Claims claims=extractAllClaim(token,type);
        return claimsResolver.apply(claims);
    }
    // Giải mã và parse toàn bộ claims trong JWT
    // Cần key tương ứng để verify chữ ký trước
    private Claims extractAllClaim(String token,TokenType type) {
        return Jwts.parserBuilder().setSigningKey(getkey(type)).build().parseClaimsJws(token).getBody();
    }
    // Kiểm tra token có hết hạn chưa (so sánh expiration với thời gian hiện tại)
    private Boolean isTokenExpired(String token,TokenType type) {
        return extractExpiration(token,type).before(new Date());
    }

    //hàm mới để lấy userId
    @Override
    public Long extractUserId(String token, TokenType type) {
        Claims claims = extractAllClaim(token, type);
        return claims.get("userId", Long.class);
    }

    @Override
    public String generateFriendRequestToken(Long senderId, Long receiverId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("senderId", senderId);
        claims.put("receiverId", receiverId);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24h
                .signWith(getkey(TokenType.FRIENDSHIP_TOKEN), SignatureAlgorithm.HS256)
                .compact();
    }


    public FriendClaimsRequest decodeFriendRequestToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getkey(TokenType.FRIENDSHIP_TOKEN))
                .build()
                .parseClaimsJws(token)
                .getBody();

        Long senderId = ((Number) claims.get("senderId")).longValue();
        Long receiverId = ((Number) claims.get("receiverId")).longValue();

        return new FriendClaimsRequest(senderId, receiverId);
    }



}
