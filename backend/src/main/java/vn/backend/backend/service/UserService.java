package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.controller.request.EditUserRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.EditUserResponse;
import vn.backend.backend.controller.response.FriendResponse;

public interface UserService extends UserDetailsService {
    EditUserResponse getUser( HttpServletRequest request);
    EditUserResponse editUser( EditUserRequest userRequest, MultipartFile file,HttpServletRequest request) throws Exception;
    String deleteFriendship(HttpServletRequest req, Long userId2);
    Page<FriendResponse>getFriends(HttpServletRequest req, int page, int size,String sortDirection);
}
