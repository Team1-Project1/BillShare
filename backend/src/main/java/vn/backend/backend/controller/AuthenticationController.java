package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.backend.backend.controller.request.SignInRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.TokenResponse;
import vn.backend.backend.service.AuthenticationService;


@RestController
@RequestMapping("/auth")
@Tag(name = "authentication controller")
@Slf4j(topic = "authentication-controller" )
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;

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
}
