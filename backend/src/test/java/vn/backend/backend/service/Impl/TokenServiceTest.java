package vn.backend.backend.service.Impl;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.backend.backend.model.TokenEntity;
import vn.backend.backend.repository.TokenRepository;

import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {

    @Mock
    private TokenRepository tokenRepository;

    @InjectMocks
    private TokenServiceImpl tokenService;

    private TokenEntity token;

    private final Long userId = 1L;
    private final String email = "test@gmail.com";
    private final String accessToken = "new-access-token";
    private final String refreshToken = "new-refresh-token";

    @BeforeEach
    void setUp() {
        token = TokenEntity.builder()
                .userId(userId)
                .email(email)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Test
    @DisplayName("saveToken - Lưu token mới thành công")
    void saveToken_createNew_success() {
        when(tokenRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(tokenRepository.save(any(TokenEntity.class))).thenAnswer(invocation -> {
            TokenEntity saved = invocation.getArgument(0);
            saved.setUserId(userId);
            return saved;
        });

        Long savedUserId = tokenService.saveToken(token);

        assertThat(savedUserId).isEqualTo(userId);

        verify(tokenRepository).save(argThat(t ->
                t.getEmail().equals(email) &&
                        t.getAccessToken().equals(accessToken) &&
                        t.getRefreshToken().equals(refreshToken)
        ));
    }

    @Test
    @DisplayName("saveToken - Cập nhật token cũ thành công")
    void saveToken_updateExisting_success() {
        TokenEntity existingToken = TokenEntity.builder()
                .userId(userId)
                .email(email)
                .accessToken("old-access")
                .refreshToken("old-refresh")
                .build();

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(existingToken));
        when(tokenRepository.save(any(TokenEntity.class))).thenReturn(existingToken);

        Long savedUserId = tokenService.saveToken(token);

        assertThat(savedUserId).isEqualTo(userId);
        assertThat(existingToken.getAccessToken()).isEqualTo(accessToken);
        assertThat(existingToken.getRefreshToken()).isEqualTo(refreshToken);

        verify(tokenRepository, times(1)).save(existingToken);
    }

    @Test
    @DisplayName("deleteToken - Xóa token thành công")
    void deleteToken_success() {
        TokenEntity existingToken = TokenEntity.builder()
                .userId(userId)
                .email(email)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(existingToken));

        String result = tokenService.deleteToken(email);

        assertThat(result).isEqualTo("token deleted");
        verify(tokenRepository).delete(existingToken);
    }

    @Test
    @DisplayName("deleteToken - Token không tồn tại")
    void deleteToken_notFound() {
        when(tokenRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tokenService.deleteToken(email))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("Token not found with email: " + email);
    }

    @Test
    @DisplayName("findByEmail - Tìm thấy token")
    void findByEmail_found() {
        when(tokenRepository.findByEmail(email)).thenReturn(Optional.of(token));

        TokenEntity found = tokenService.findByEmail(email);

        assertThat(found).isEqualTo(token);
        assertThat(found.getEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("findByEmail - Không tìm thấy token")
    void findByEmail_notFound() {
        when(tokenRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tokenService.findByEmail(email))
                .isInstanceOf(NoSuchElementException.class)
                .hasMessage("Token not found with email: " + email);
    }
}