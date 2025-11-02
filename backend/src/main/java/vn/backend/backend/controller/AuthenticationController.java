package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.request.ChangePasswordRequest;
import vn.backend.backend.controller.request.SignInRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.TokenResponse;
import vn.backend.backend.repository.ForgotPasswordRepository;
import vn.backend.backend.service.AuthenticationService;
import vn.backend.backend.service.EmailService;
import vn.backend.backend.service.OtpService;

import java.io.IOException;
import java.io.UnsupportedEncodingException;


@RestController
@RequestMapping("/auth")
@Tag(name = "authentication controller")
@Slf4j(topic = "authentication-controller" )
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final EmailService emailService;
    private final OtpService otpService;

    @Operation(summary = "Register new user", description = "API to add a new user to the database")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Long>> register(@Valid @RequestBody UserCreateRequest request) {
        long userId = authenticationService.register(request);
        return ResponseEntity.ok(
                new ApiResponse<>("success", "Đăng ký tài khoản thành công!", userId)
        );
    }
//    public ResponseEntity<Long> register(@Valid @RequestBody UserCreateRequest request) {
//        long userId = authenticationService.register(request);
//        return ResponseEntity.status(HttpStatus.CREATED).body(userId);
//    }

    @Operation(summary = "Login account", description = "API to authenticate user and return JWT token")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@RequestBody SignInRequest request) {
        try {
            TokenResponse token = authenticationService.authenticated(request);
            return ResponseEntity.ok(
                    new ApiResponse<>("success", "Đăng nhập thành công!", token)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new ApiResponse<>("error", "Sai email hoặc mật khẩu!", null)
            );
        }
    }
//    public ResponseEntity<TokenResponse> login(@RequestBody SignInRequest request) {
//        TokenResponse token = authenticationService.authenticated(request);
//        return ResponseEntity.ok(token);
//    }

    @Operation(summary = "refresh token", description = "API to refresh token")
    @PostMapping("/refresh-token")
    public ResponseEntity<TokenResponse> refreshToken(HttpServletRequest request) {
        TokenResponse token=authenticationService.refresh(request);
        return ResponseEntity.ok(token);
    }
    @Operation(summary = "logout account", description = "API to logout account")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String result=authenticationService.logout(request);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "forgot-password", description = "API for forgot password to send OTP to email")
    @PostMapping("/verify-email/{email}")
    public ResponseEntity<ApiResponse<String>>  forgotPassword(@PathVariable String email) throws MessagingException, IOException{
        String result=emailService.sendResetPasswordOTP(email);
        return ResponseEntity.ok(
                new ApiResponse<>("success", result, null)
        );
    }

    @Operation(summary = "verify otp", description = "API to verify otp for reset password")
    @PostMapping("/verify-otp/{otp}/{email}")
    public ResponseEntity<ApiResponse<String>>  forgotPassword(@PathVariable Integer otp,@PathVariable String email) throws MessagingException, UnsupportedEncodingException {

        String result=otpService.verifyOtp(email,otp.toString());
        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("verify OTP for email %s successfully",email), result)
        );
    }

    @Operation(summary = "change password", description = "API to change password after verify otp")
    @PostMapping("/change-password/{token}")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody ChangePasswordRequest request, @PathVariable String token) throws MessagingException, UnsupportedEncodingException {

        String result=otpService.resetPassword(token,request);
        return ResponseEntity.ok(
                new ApiResponse<>("success", result, null)
        );
    }
}
