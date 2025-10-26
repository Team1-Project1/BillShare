package vn.backend.backend.service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.EditUserRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.EditUserResponse;
import vn.backend.backend.controller.response.FriendResponse;
import vn.backend.backend.model.FriendshipEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.FriendshipRepository;
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
    private final FriendshipRepository friendshipRepository;

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
    @Override
    public String deleteFriendship(HttpServletRequest req, Long userId2) {
        String token=req.getHeader("Authorization").substring("Bearer ".length());
        Long userId1=jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        var friendship = friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                userId1, userId2, userId2, userId1
        );
        if(friendship==null ){
            return String.format("No friendship exists between user %d and user %d.", userId1, userId2);
        }
        if(friendship.getStatus().equals(FriendshipStatus.blocked)){
            return "You cannot delete this friendship because one of the users is blocked.";
        }
        if(friendship.getStatus().equals(FriendshipStatus.pending)){
            return "You cannot delete this friendship because the friend request is still pending.";
        }
        friendshipRepository.delete(friendship);
        return String.format("Friendship between user %d and user %d has been deleted.", userId1, userId2);
    }

    @Override
    public Page<FriendResponse> getFriends(HttpServletRequest req, int page, int size, String sortDirection) {
        String token=req.getHeader("Authorization").substring("Bearer ".length());
        Long userId=jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        Sort.Direction direction;
        if ("asc".equalsIgnoreCase(sortDirection)) {
            direction = Sort.Direction.ASC;
        } else if ("desc".equalsIgnoreCase(sortDirection)) {
            direction = Sort.Direction.DESC;
        } else {
            direction = Sort.Direction.DESC;
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "createdAt"));
        Page<FriendshipEntity> friendships = friendshipRepository.findAllByUser1UserIdAndStatusOrUser2UserIdAndStatus(userId, FriendshipStatus.accepted, userId, FriendshipStatus.accepted, pageable);
        return friendships.map(friend->{
            UserEntity friendUser=friend.getUser1().getUserId().equals(userId) ? friend.getUser2() : friend.getUser1();
            return  FriendResponse.builder()
                    .id(friendUser.getUserId())
                    .fullName(friendUser.getFullName())
                    .email(friendUser.getEmail())
                    .phone(friendUser.getPhone())
                    .avatarUrl(friendUser.getAvatarUrl())
                    .createdAt(friend.getCreatedAt())
                    .build();
        });
    }
}
