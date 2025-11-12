package vn.backend.backend.service.Impl;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.backend.backend.controller.request.SignInRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.TokenResponse;
import vn.backend.backend.model.TokenEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.ForgotPasswordRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.JwtService;
import vn.backend.backend.service.TokenService;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;
import static vn.backend.backend.common.TokenType.REFRESH_TOKEN;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private TokenService tokenService;
    @Mock private ForgotPasswordRepository forgotPasswordRepository;
    @Mock private HttpServletRequest httpServletRequest;
    @Mock private Authentication authentication;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private UserEntity user;
    private UserCreateRequest createRequest;
    private SignInRequest signInRequest;

    private final String rawPassword = "password123";
    private final String encodedPassword = "encodedPassword123";
    private final String accessToken = "access-token-jwt";
    private final String refreshToken = "refresh-token-jwt";
    private final String email = "test@gmail.com";

    @BeforeEach
    void setUp() {
        user = UserEntity.builder()
                .userId(1L)
                .email(email)
                .password(encodedPassword)
                .fullName("Test User")
                .phone("0123456789")
                .build();

        createRequest = new UserCreateRequest();
        createRequest.setEmail(email);
        createRequest.setPassword(rawPassword);
        createRequest.setFullName("Test User");
        createRequest.setPhone("0123456789");

        signInRequest = new SignInRequest();
        signInRequest.setEmail(email);
        signInRequest.setPassword(rawPassword);
    }

    @Test
    @DisplayName("Register thành công - trả về userId")
    void register_success() {
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity saved = invocation.getArgument(0);
            saved.setUserId(1L);
            return saved;
        });

        Long userId = authenticationService.register(createRequest);

        assertThat(userId).isEqualTo(1L);
        verify(userRepository).save(argThat(u ->
                u.getEmail().equals(email) &&
                        u.getFullName().equals("Test User") &&
                        u.getPhone().equals("0123456789") &&
                        u.getPassword().equals(encodedPassword)
        ));
    }

    @Test
    @DisplayName("authenticated() - Đăng nhập thành công")
    void authenticated_success() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user)).thenReturn(accessToken);
        when(jwtService.generateRefreshToken(user)).thenReturn(refreshToken);

        TokenResponse response = authenticationService.authenticated(signInRequest);

        assertThat(response.getAccessToken()).isEqualTo(accessToken);
        assertThat(response.getRefreshToken()).isEqualTo(refreshToken);
        assertThat(response.getUserId()).isEqualTo(1L);

        verify(tokenService).saveToken(argThat(token ->
                token.getUserId().equals(1L) &&
                        token.getEmail().equals(email) &&
                        token.getAccessToken().equals(accessToken) &&
                        token.getRefreshToken().equals(refreshToken)
        ));
    }

    @Test
    @DisplayName("authenticated() - Email không tồn tại")
    void authenticated_emailNotFound() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authenticationService.authenticated(signInRequest))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("email not found");
    }

    @Test
    @DisplayName("authenticated() - Sai mật khẩu")
    void authenticated_wrongPassword() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThatThrownBy(() -> authenticationService.authenticated(signInRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("refresh() - Refresh token thành công")
    void refresh_success() {
        TokenEntity tokenEntity = TokenEntity.builder()
                .userId(1L)
                .email(email)
                .accessToken("old-access-token")
                .refreshToken(refreshToken)
                .build();

        when(httpServletRequest.getHeader("refresh-token")).thenReturn(refreshToken);
        when(jwtService.extractEmail(refreshToken, REFRESH_TOKEN)).thenReturn(email);
        when(tokenService.findByEmail(email)).thenReturn(tokenEntity);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtService.isValid(refreshToken, user, REFRESH_TOKEN)).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn(accessToken);

        TokenResponse response = authenticationService.refresh(httpServletRequest);

        assertThat(response.getAccessToken()).isEqualTo(accessToken);
        assertThat(response.getRefreshToken()).isEqualTo(refreshToken);
        assertThat(response.getUserId()).isEqualTo(1L);

        // ĐÃ SỬA: Không verify trên entity → verify trên tokenService.saveToken()
        verify(tokenService).saveToken(argThat(token ->
                token.getUserId().equals(1L) &&
                        token.getEmail().equals(email) &&
                        token.getAccessToken().equals(accessToken) &&
                        token.getRefreshToken().equals(refreshToken)
        ));
    }

    @Test
    @DisplayName("refresh() - Không có refresh token trong header")
    void refresh_missingRefreshToken() {
        when(httpServletRequest.getHeader("refresh-token")).thenReturn(null);

        assertThatThrownBy(() -> authenticationService.refresh(httpServletRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Refresh token is required");
    }

    @Test
    @DisplayName("refresh() - Refresh token không hợp lệ (khác với DB)")
    void refresh_invalidToken_notMatchDB() {
        TokenEntity tokenEntity = TokenEntity.builder()
                .userId(1L)
                .email(email)
                .refreshToken("different-refresh-token")
                .build();

        when(httpServletRequest.getHeader("refresh-token")).thenReturn(refreshToken);
        when(jwtService.extractEmail(refreshToken, REFRESH_TOKEN)).thenReturn(email);
        when(tokenService.findByEmail(email)).thenReturn(tokenEntity);

        assertThatThrownBy(() -> authenticationService.refresh(httpServletRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Refresh token invalid");
    }

    @Test
    @DisplayName("refresh() - Refresh token hết hạn hoặc không hợp lệ")
    void refresh_tokenExpiredOrInvalid() {
        TokenEntity tokenEntity = TokenEntity.builder()
                .userId(1L)
                .email(email)
                .refreshToken(refreshToken)
                .build();

        when(httpServletRequest.getHeader("refresh-token")).thenReturn(refreshToken);
        when(jwtService.extractEmail(refreshToken, REFRESH_TOKEN)).thenReturn(email);
        when(tokenService.findByEmail(email)).thenReturn(tokenEntity);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtService.isValid(refreshToken, user, REFRESH_TOKEN)).thenReturn(false);

        assertThatThrownBy(() -> authenticationService.refresh(httpServletRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Refresh token invalid");
    }

    @Test
    @DisplayName("logout() - Đăng xuất thành công")
    void logout_success() {
        when(httpServletRequest.getHeader("refresh-token")).thenReturn(refreshToken);
        when(jwtService.extractEmail(refreshToken, REFRESH_TOKEN)).thenReturn(email);

        String result = authenticationService.logout(httpServletRequest);

        assertThat(result).isEqualTo("logout successfully");
        verify(tokenService).deleteToken(email);
    }

    @Test
    @DisplayName("logout() - Không có refresh token")
    void logout_missingRefreshToken() {
        when(httpServletRequest.getHeader("refresh-token")).thenReturn("   ");

        assertThatThrownBy(() -> authenticationService.logout(httpServletRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Refresh token is required");
    }
}