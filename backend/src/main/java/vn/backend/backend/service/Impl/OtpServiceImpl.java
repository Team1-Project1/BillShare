package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.ChangePasswordRequest;
import vn.backend.backend.model.ForgotPasswordEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.ForgotPasswordRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.JwtService;
import vn.backend.backend.service.OtpService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {
    private final UserRepository userRepository;
    private final ForgotPasswordRepository forgotOtpRepository;
    private final JwtService jwtUtil;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${app.otp.max-retries}")
    private int maxRetries;

    @Override
    @Transactional
    public String verifyOtp(String email, String otp) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        ForgotPasswordEntity fp = forgotOtpRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("No OTP request found"));

        if (fp.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if (fp.getRetryCount() >= maxRetries) {
            throw new RuntimeException("Too many attempts. Please request new OTP.");
        }

        boolean matches = passwordEncoder.matches(otp, fp.getOtpHash());
        if (!matches) {
            fp.setRetryCount(fp.getRetryCount() + 1);
            forgotOtpRepository.save(fp);
            throw new RuntimeException("Invalid OTP");
        }

        // success: delete or invalidate OTP to prevent reuse
        user.setForgotPassword(null);
        userRepository.save(user); // cập nhật user trước
        forgotOtpRepository.delete(fp);
        // generate JWT short-lived for reset password
        return jwtUtil.generateOtpToken(email);
    }

    @Override
    @Transactional
    public String resetPassword(String token, ChangePasswordRequest request) {
        String email = jwtUtil.extractEmail(token,TokenType.OTP_TOKEN);
        if(email == null || email.isEmpty()) {
            throw new RuntimeException("Invalid token");
        }
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if(!request.getPassword().equals(request.getRepeatPassword())) {
            throw new RuntimeException("Password and Confirm Password do not match");
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // cleanup any existing otp record
        forgotOtpRepository.findByUser(user).ifPresent(forgotOtpRepository::delete);

        return "Password reset successfully";
    }
}
