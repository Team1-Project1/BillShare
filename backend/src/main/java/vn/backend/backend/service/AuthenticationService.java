package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.userdetails.UserDetails;
import vn.backend.backend.controller.request.ChangePasswordRequest;
import vn.backend.backend.controller.request.SignInRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.TokenResponse;

public interface AuthenticationService {
    Long register(UserCreateRequest request);
    TokenResponse authenticated(SignInRequest request);
    TokenResponse refresh(HttpServletRequest request );
    String logout(HttpServletRequest request );
}
