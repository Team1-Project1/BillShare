package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.controller.request.EditUserRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.EditUserResponse;

public interface UserService extends UserDetailsService {
    EditUserResponse getUser( HttpServletRequest request);
    EditUserResponse editUser( EditUserRequest userRequest, MultipartFile file,HttpServletRequest request) throws Exception;
}
