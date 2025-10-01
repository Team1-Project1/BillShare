package vn.backend.backend.service.Impl;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.SignInRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.TokenResponse;
import vn.backend.backend.model.TokenEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.AuthenticationService;
import vn.backend.backend.service.JwtService;
import vn.backend.backend.service.TokenService;

import java.util.Optional;

import static vn.backend.backend.common.TokenType.REFRESH_TOKEN;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder ;
    private final AuthenticationManager authenticationManager ;
    private final JwtService jwtService ;
    private final TokenService tokenService ;

    @Override
    public Long register(UserCreateRequest request) {
        log.info("User saving");
        UserEntity user=UserEntity.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .fullName(request.getFullName())
                .build();
        userRepository.save(user);
        log.info("user has save , userId={}", user.getUserId());
        return user.getUserId();
    }

    @Override
    public TokenResponse authenticated(SignInRequest request) {
        // ----------- LUỒNG XỬ LÝ -----------
        // 1. UsernamePasswordAuthenticationToken được tạo ra từ email + password (chưa xác thực).
        //    -> Đây chỉ là "gói" chứa thông tin đăng nhập mà client gửi lên.

        // 2. authenticationManager.authenticate(token):
        //    -> Spring Security sẽ duyệt qua các AuthenticationProvider đã cấu hình (ở đây là DaoAuthenticationProvider).

        // 3. Trong DaoAuthenticationProvider:
        //    -> Gọi userService.loadUserByUsername(email)
        //       => userService lấy thông tin User từ database (email, mật khẩu mã hóa, roles, ...).

        // 4. DaoAuthenticationProvider gọi passwordEncoder.matches(rawPassword, encodedPassword)
        //    -> So sánh mật khẩu người dùng nhập (raw) với mật khẩu trong DB (BCrypt đã mã hóa).

        // 5. Nếu mật khẩu đúng:
        //    -> DaoAuthenticationProvider tạo ra một đối tượng Authentication (authenticated = true).
        //    -> Authentication này chứa thông tin user + roles (authorities).
        //    -> Trả lại cho AuthenticationManager, sau đó trả về cho bạn trong AuthenticationService.

        // 6. Nếu mật khẩu sai hoặc không tìm thấy user:
        //    -> Ném ra BadCredentialsException hoặc UsernameNotFoundException.
        //    -> Login thất bại.
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        var user=userRepository.findByEmail(request.getEmail()).orElseThrow(()->new UsernameNotFoundException("email not found"));
        String accessToken=jwtService.generateAccessToken(user);
        String refreshToken=jwtService.generateRefreshToken(user);
        tokenService.saveToken(TokenEntity.builder().
                userId(user.getUserId()).
                email(user.getEmail()).
                accessToken(accessToken).
                refreshToken(refreshToken).
                build());
        return TokenResponse.builder().
                accessToken(accessToken).
                refreshToken(refreshToken).
                userId(user.getUserId()).
                build();
    }
    @Override
    public TokenResponse refresh(HttpServletRequest request ){
        String refreshToken=request.getHeader("refresh-token");
        if (StringUtils.isBlank(refreshToken)) {
            throw new BadCredentialsException("Refresh token is required");
        }

        final String email=jwtService.extractEmail(refreshToken, TokenType.REFRESH_TOKEN);
        var tokenEntity = tokenService.findByEmail(email);
        if (!refreshToken.equals(tokenEntity.getRefreshToken())) {
            throw new BadCredentialsException("Refresh token invalid");
        }
        Optional<UserEntity> user=userRepository.findByEmail(email);
        if (!jwtService.isValid(refreshToken,user.get(),TokenType.REFRESH_TOKEN)){
            throw new BadCredentialsException("Refresh token invalid");
        }
        String accessToken=jwtService.generateAccessToken(user.get());
        tokenEntity.setAccessToken(accessToken);
        tokenService.saveToken(tokenEntity);
        return TokenResponse.builder().
                accessToken(accessToken).
                refreshToken(refreshToken).
                userId(user.get().getUserId()).
                build();
    }

    @Override
    public String logout(HttpServletRequest request) {
        String refreshToken=request.getHeader("refresh-token");
        if (StringUtils.isBlank(refreshToken)) {
            throw new BadCredentialsException("Refresh token is required");
        }
        String email=jwtService.extractEmail(refreshToken, REFRESH_TOKEN);
        tokenService.deleteToken(email);
        return "logout successfully";
    }
}
