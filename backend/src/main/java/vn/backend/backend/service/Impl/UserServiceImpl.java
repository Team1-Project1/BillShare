package vn.backend.backend.service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.EditUserRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.EditUserResponse;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.JwtService;
import vn.backend.backend.service.TokenService;
import vn.backend.backend.service.UploadImageService;
import vn.backend.backend.service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;




@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UploadImageService uploadImageService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final JwtService jwtService; ;
    private final TokenService tokenService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Email not found"));
    }


    @Override
    public EditUserResponse getUser(HttpServletRequest request) {
        String token=request.getHeader("Authorization").substring("Bearer ".length());
        Long userId=jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        UserEntity user = userRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return EditUserResponse.builder()
                .id(userId)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Override
    public EditUserResponse editUser( EditUserRequest userRequest, MultipartFile file,HttpServletRequest request) throws Exception {
        String token=request.getHeader("Authorization").substring("Bearer ".length());
        Long userId=jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        String email=jwtService.extractEmail(token, TokenType.ACCESS_TOKEN);
        UserEntity user = userRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (!StringUtils.isEmpty(userRequest.getOldPassword()) && !StringUtils.isEmpty(userRequest.getNewPassword()) && !StringUtils.isEmpty(userRequest.getRepeatNewPassword())) {
            if (!passwordEncoder.matches(userRequest.getOldPassword(), user.getPassword())) {
                throw new RuntimeException("Old password is incorrect");
            }
            if (!userRequest.getNewPassword().equals(userRequest.getRepeatNewPassword())) {
                throw new RuntimeException("New passwords do not match");
            }
            user.setPassword(passwordEncoder.encode(userRequest.getNewPassword()));
        }
        user.setFullName(userRequest.getFullName());
        if(!userRequest.getEmail().equals(user.getEmail())){
            Boolean isEmailChanged = userRepository.existsByEmailAndUserIdNot(userRequest.getEmail(), userId);
            if (isEmailChanged) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(userRequest.getEmail());
        }
        if(!userRequest.getPhone().equals(user.getPhone())){
            Boolean isPhoneChanged = userRepository.existsByPhoneAndUserIdNot(userRequest.getPhone(), userId);
            if (isPhoneChanged) {
                throw new RuntimeException("Phone already exists");
            }
            user.setPhone(userRequest.getPhone());
        }
        if (file == null || file.isEmpty()) {
        }
        else{
            String imageUrl = uploadImageService.uploadImage(file);
            user.setAvatarUrl(imageUrl);
        }
        userRepository.save(user);
        if(!user.getEmail().equals(email)){
            tokenService.deleteToken(email);
            log.info("User with email {} has changed their email. All tokens associated with the old email have been deleted.", email);
        }
        return EditUserResponse.builder()
                .id(userId)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
