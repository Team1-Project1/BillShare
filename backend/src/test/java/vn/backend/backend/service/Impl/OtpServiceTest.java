package vn.backend.backend.service.Impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.ChangePasswordRequest;
import vn.backend.backend.model.ForgotPasswordEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.ForgotPasswordRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.JwtService;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ForgotPasswordRepository forgotOtpRepository;

    @Mock
    private JwtService jwtUtil;

    @InjectMocks
    private OtpServiceImpl otpService;

    private UserEntity user;
    private ForgotPasswordEntity fpEntity;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final String rawOtp = "123456";
    private final String otpHash = passwordEncoder.encode(rawOtp);

    @BeforeEach
    void setUp() {
        // Set giá trị cho @Value("${app.otp.max-retries}")
        ReflectionTestUtils.setField(otpService, "maxRetries", 3);

        user = new UserEntity();
        user.setUserId(1L);
        user.setEmail("test@example.com");
        user.setPassword("oldhashed");

        fpEntity = new ForgotPasswordEntity();
        fpEntity.setUser(user);
        fpEntity.setOtpHash(otpHash);
        fpEntity.setRetryCount(0);
        fpEntity.setExpirationTime(LocalDateTime.now().plusMinutes(10));
    }

    @Test
    void verifyOtp_success_deletesOtpAndReturnsToken() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(forgotOtpRepository.findByUser(user)).thenReturn(Optional.of(fpEntity));
        when(jwtUtil.generateOtpToken("test@example.com")).thenReturn("jwt-token-123");

        String token = otpService.verifyOtp("test@example.com", rawOtp);

        assertEquals("jwt-token-123", token);

        // verify các hành động trên repository
        verify(userRepository).save(user);
        verify(forgotOtpRepository).delete(fpEntity);

        // verify setter được gọi (dùng ArgumentCaptor để kiểm tra chính xác)
        ArgumentCaptor<UserEntity> userCaptor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(userCaptor.capture());
        assertNull(userCaptor.getValue().getForgotPassword());
    }

    @Test
    void verifyOtp_userNotFound_throwsException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> otpService.verifyOtp("unknown@example.com", rawOtp));

        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test
    void verifyOtp_noOtpRequest_throwsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(forgotOtpRepository.findByUser(user)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> otpService.verifyOtp("test@example.com", rawOtp));

        assertEquals("No OTP request found", ex.getMessage());
    }

    @Test
    void verifyOtp_expired_throwsException() {
        fpEntity.setExpirationTime(LocalDateTime.now().minusMinutes(1));
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(forgotOtpRepository.findByUser(user)).thenReturn(Optional.of(fpEntity));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> otpService.verifyOtp("test@example.com", rawOtp));

        assertEquals("OTP expired", ex.getMessage());
    }

    @Test
    void verifyOtp_tooManyRetries_throwsException() {
        fpEntity.setRetryCount(3); // bằng maxRetries
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(forgotOtpRepository.findByUser(user)).thenReturn(Optional.of(fpEntity));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> otpService.verifyOtp("test@example.com", rawOtp));

        assertEquals("Too many attempts. Please request new OTP.", ex.getMessage());
        verify(forgotOtpRepository, never()).save(any());
    }

    @Test
    void verifyOtp_wrongOtp_incrementsRetryCount() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(forgotOtpRepository.findByUser(user)).thenReturn(Optional.of(fpEntity));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> otpService.verifyOtp("test@example.com", "wrong"));

        assertEquals("Invalid OTP", ex.getMessage());

        // Kiểm tra retryCount tăng lên 1
        ArgumentCaptor<ForgotPasswordEntity> fpCaptor = ArgumentCaptor.forClass(ForgotPasswordEntity.class);
        verify(forgotOtpRepository).save(fpCaptor.capture());
        assertEquals(1, fpCaptor.getValue().getRetryCount());

        verify(forgotOtpRepository, never()).delete(any());
    }

    @Test
    void resetPassword_success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPassword("newPass123");
        request.setRepeatPassword("newPass123");

        when(jwtUtil.extractEmail("valid-token", TokenType.OTP_TOKEN)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(forgotOtpRepository.findByUser(user)).thenReturn(Optional.of(fpEntity));

        String result = otpService.resetPassword("valid-token", request);

        assertEquals("Password reset successfully", result);
        assertTrue(passwordEncoder.matches("newPass123", user.getPassword()));

        verify(userRepository).save(user);
        verify(forgotOtpRepository).delete(fpEntity);
    }

    @Test
    void resetPassword_passwordsDoNotMatch_throwsException() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPassword("pass1");
        request.setRepeatPassword("pass2");

        when(jwtUtil.extractEmail(any(), any())).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> otpService.resetPassword("token", request));

        assertEquals("Password and Confirm Password do not match", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_invalidToken_throwsException() {
        when(jwtUtil.extractEmail("bad-token", TokenType.OTP_TOKEN)).thenReturn(null);

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPassword("new");
        request.setRepeatPassword("new");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> otpService.resetPassword("bad-token", request));

        assertEquals("Invalid token", ex.getMessage());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void resetPassword_userNotFound_throwsException() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPassword("new");
        request.setRepeatPassword("new");

        when(jwtUtil.extractEmail(any(), any())).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> otpService.resetPassword("token", request));

        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void resetPassword_noExistingOtp_stillResetsPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setPassword("newPass");
        request.setRepeatPassword("newPass");

        when(jwtUtil.extractEmail(any(), any())).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(forgotOtpRepository.findByUser(user)).thenReturn(Optional.empty());

        String result = otpService.resetPassword("token", request);

        assertEquals("Password reset successfully", result);
        verify(forgotOtpRepository, never()).delete(any());
        verify(userRepository).save(user);
    }
}