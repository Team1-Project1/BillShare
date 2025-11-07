package vn.backend.backend.service.Impl;

import com.cloudinary.Cloudinary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.EditUserRequest;
import vn.backend.backend.controller.response.EditUserResponse;
import vn.backend.backend.controller.response.FriendResponse;
import vn.backend.backend.model.FriendshipEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.FriendshipRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.JwtService;
import vn.backend.backend.service.TokenService;
import vn.backend.backend.service.UploadImageService;

import java.util.*;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UploadImageService uploadImageService;

    @Mock
    private JwtService jwtService;

    @Mock
    private TokenService tokenService;

    @Mock
    private FriendshipRepository friendshipRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private PasswordEncoder passwordEncoder;
    private UserEntity user;
    private MockHttpServletRequest request;
    private final Long USER_ID = 1L;
    private final String EMAIL = "old@example.com";
    private final String TOKEN = "valid-jwt-token";
    private final String ENCODED_PASSWORD = "$2a$10$examplehashedpassword";

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        user = UserEntity.builder()
                .userId(USER_ID)
                .fullName("Nguyen Van A")
                .email(EMAIL)
                .phone("0123456789")
                .password(ENCODED_PASSWORD)
                .avatarUrl("https://example.com/avatar.jpg")
                .build();

        request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + TOKEN);
    }

    // ========== loadUserByUsername Tests ==========

    @Test
    void loadUserByUsername_Success() {
        // Given
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));

        // When
        var userDetails = userService.loadUserByUsername(EMAIL);

        // Then
        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo(EMAIL);
        verify(userRepository).findByEmail(EMAIL);
    }

    @Test
    void loadUserByUsername_NotFound_ThrowsException() {
        // Given
        String unknownEmail = "unknown@example.com";
        when(userRepository.findByEmail(unknownEmail)).thenReturn(Optional.empty());

        // When & Then
        UsernameNotFoundException exception = assertThrows(
            UsernameNotFoundException.class,
            () -> userService.loadUserByUsername(unknownEmail)
        );
        assertThat(exception.getMessage()).isEqualTo("Email not found");
        verify(userRepository).findByEmail(unknownEmail);
    }

    // ========== getUser Tests ==========

    @Test
    void getUser_Success() {
        // Given
        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));

        // When
        EditUserResponse response = userService.getUser(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(USER_ID);
        assertThat(response.getFullName()).isEqualTo("Nguyen Van A");
        assertThat(response.getEmail()).isEqualTo(EMAIL);
        assertThat(response.getPhone()).isEqualTo("0123456789");
        assertThat(response.getAvatarUrl()).isEqualTo("https://example.com/avatar.jpg");

        verify(jwtService).extractUserId(TOKEN, TokenType.ACCESS_TOKEN);
        verify(userRepository).findByUserId(USER_ID);
    }

    @Test
    void getUser_UserNotFound_ThrowsException() {
        // Given
        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> userService.getUser(request));
        assertThat(exception.getMessage()).isEqualTo("User not found");
    }

    // ========== editUser Tests ==========

    @Test
    void editUser_UpdateProfileOnly_Success() throws Exception {
        // Given
        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName("Nguyen Van B")
                .email(EMAIL)
                .phone("0987654321")
                .build();

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.extractEmail(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(EMAIL);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(userRepository.existsByPhoneAndUserIdNot("0987654321", USER_ID)).thenReturn(false);
        when(userRepository.save(any(UserEntity.class))).thenReturn(user);

        // When
        EditUserResponse response = userService.editUser(editRequest, null, request);

        // Then
        assertThat(response.getFullName()).isEqualTo("Nguyen Van B");
        assertThat(response.getPhone()).isEqualTo("0987654321");
        verify(userRepository).save(user);
        verify(tokenService, never()).deleteToken(anyString());
    }

    @Test
    void editUser_ChangePassword_Success() throws Exception {
        // Given
        String oldPassword = "oldPass123";
        String newPassword = "newPass123";

        user.setPassword(passwordEncoder.encode(oldPassword));

        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName(user.getFullName())
                .email(EMAIL)
                .phone(user.getPhone())
                .oldPassword(oldPassword)
                .newPassword(newPassword)
                .repeatNewPassword(newPassword)
                .build();

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.extractEmail(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(EMAIL);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(userRepository.save(any(UserEntity.class))).thenReturn(user);

        // When
        userService.editUser(editRequest, null, request);

        // Then
        assertTrue(passwordEncoder.matches(newPassword, user.getPassword()));
        verify(userRepository).save(user);
    }

    @Test
    void editUser_WrongOldPassword_ThrowsException() {
        // Given
        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName("Test")
                .email(EMAIL)
                .phone("0123456789")
                .oldPassword("wrongOldPass")
                .newPassword("newPass123")
                .repeatNewPassword("newPass123")
                .build();

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.editUser(editRequest, null, request));
        assertThat(exception.getMessage()).isEqualTo("Old password is incorrect");
        verify(userRepository, never()).save(any());
    }

    @Test
    void editUser_NewPasswordsNotMatch_ThrowsException() {
        // Given
        String oldPassword = "oldPass123";
        user.setPassword(passwordEncoder.encode(oldPassword));

        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName("Test")
                .email(EMAIL)
                .phone("0123456789")
                .oldPassword(oldPassword)
                .newPassword("newPass123")
                .repeatNewPassword("differentPass")
                .build();

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.editUser(editRequest, null, request));
        assertThat(exception.getMessage()).isEqualTo("New passwords do not match");
        verify(userRepository, never()).save(any());
    }

    @Test
    void editUser_EmailAlreadyExists_ThrowsException() {
        // Given
        String newEmail = "existing@example.com";
        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName(user.getFullName())
                .email(newEmail)
                .phone(user.getPhone())
                .build();

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.extractEmail(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(EMAIL);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndUserIdNot(newEmail, USER_ID)).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.editUser(editRequest, null, request));
        assertThat(exception.getMessage()).isEqualTo("Email already exists");
        verify(userRepository, never()).save(any());
    }

    @Test
    void editUser_PhoneAlreadyExists_ThrowsException() {
        // Given
        String newPhone = "0999999999";
        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName(user.getFullName())
                .email(EMAIL)
                .phone(newPhone)
                .build();

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.extractEmail(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(EMAIL);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(userRepository.existsByPhoneAndUserIdNot(newPhone, USER_ID)).thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> userService.editUser(editRequest, null, request));
        assertThat(exception.getMessage()).isEqualTo("Phone already exists");
        verify(userRepository, never()).save(any());
    }

    @Test
    void editUser_ChangeEmail_DeletesOldTokens() throws Exception {
        // Given
        String newEmail = "new@example.com";
        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName(user.getFullName())
                .email(newEmail)
                .phone(user.getPhone())
                .build();

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.extractEmail(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(EMAIL);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndUserIdNot(newEmail, USER_ID)).thenReturn(false);
        when(userRepository.save(any(UserEntity.class))).thenReturn(user);

        // When
        userService.editUser(editRequest, null, request);

        // Then
        assertThat(user.getEmail()).isEqualTo(newEmail);
        verify(tokenService).deleteToken(EMAIL);
        verify(userRepository).save(user);
    }

    @Test
    void editUser_UploadAvatar_Success() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.jpg", "image/jpeg", "test image".getBytes());

        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName(user.getFullName())
                .email(EMAIL)
                .phone(user.getPhone())
                .build();

        String newAvatarUrl = "https://cloudinary.com/new-avatar.jpg";

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.extractEmail(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(EMAIL);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(uploadImageService.uploadImage(file)).thenReturn(newAvatarUrl);
        when(userRepository.save(any(UserEntity.class))).thenReturn(user);

        // When
        EditUserResponse response = userService.editUser(editRequest, file, request);

        // Then
        assertThat(response.getAvatarUrl()).isEqualTo(newAvatarUrl);
        assertThat(user.getAvatarUrl()).isEqualTo(newAvatarUrl);
        verify(uploadImageService).uploadImage(file);
        verify(userRepository).save(user);
    }

    @Test
    void editUser_EmptyFile_DoesNotUploadAvatar() throws Exception {
        // Given
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "avatar.jpg", "image/jpeg", new byte[0]);

        EditUserRequest editRequest = EditUserRequest.builder()
                .fullName(user.getFullName())
                .email(EMAIL)
                .phone(user.getPhone())
                .build();

        String originalAvatarUrl = user.getAvatarUrl();

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(jwtService.extractEmail(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(EMAIL);
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(userRepository.save(any(UserEntity.class))).thenReturn(user);

        // When
        EditUserResponse response = userService.editUser(editRequest, emptyFile, request);

        // Then
        assertThat(response.getAvatarUrl()).isEqualTo(originalAvatarUrl);
        verify(uploadImageService, never()).uploadImage(any());
    }

    // ========== deleteFriendship Tests ==========

    @Test
    void deleteFriendship_Success() {
        // Given
        Long friendId = 2L;
        UserEntity friend = UserEntity.builder().userId(friendId).fullName("Friend").build();
        FriendshipEntity friendship = new FriendshipEntity();
        friendship.setUser1(user);
        friendship.setUser2(friend);
        friendship.setStatus(FriendshipStatus.accepted);

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                USER_ID, friendId, friendId, USER_ID)).thenReturn(friendship);

        // When
        String result = userService.deleteFriendship(request, friendId);

        // Then
        assertThat(result).isEqualTo(String.format("Friendship between user %d and user %d has been deleted.", USER_ID, friendId));
        verify(friendshipRepository).delete(friendship);
    }

    @Test
    void deleteFriendship_NoFriendship_ReturnsMessage() {
        // Given
        Long friendId = 2L;
        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong())).thenReturn(null);

        // When
        String result = userService.deleteFriendship(request, friendId);

        // Then
        assertThat(result).isEqualTo(String.format("No friendship exists between user %d and user %d.", USER_ID, friendId));
        verify(friendshipRepository, never()).delete(any());
    }

    @Test
    void deleteFriendship_BlockedStatus_ReturnsError() {
        // Given
        Long friendId = 2L;
        UserEntity friend = UserEntity.builder().userId(friendId).build();
        FriendshipEntity friendship = new FriendshipEntity();
        friendship.setUser1(user);
        friendship.setUser2(friend);
        friendship.setStatus(FriendshipStatus.blocked);

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong())).thenReturn(friendship);

        // When
        String result = userService.deleteFriendship(request, friendId);

        // Then
        assertThat(result).isEqualTo("You cannot delete this friendship because one of the users is blocked.");
        verify(friendshipRepository, never()).delete(any());
    }

    @Test
    void deleteFriendship_PendingStatus_ReturnsError() {
        // Given
        Long friendId = 2L;
        UserEntity friend = UserEntity.builder().userId(friendId).build();
        FriendshipEntity friendship = new FriendshipEntity();
        friendship.setUser1(user);
        friendship.setUser2(friend);
        friendship.setStatus(FriendshipStatus.pending);

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong())).thenReturn(friendship);

        // When
        String result = userService.deleteFriendship(request, friendId);

        // Then
        assertThat(result).isEqualTo("You cannot delete this friendship because the friend request is still pending.");
        verify(friendshipRepository, never()).delete(any());
    }

    // ========== getFriends Tests ==========

    @ParameterizedTest
    @ValueSource(strings = {"asc", "desc", "ASC", "DESC", "invalid"})
    void getFriends_DifferentSortDirections(String sortDirection) {
        // Given
        int page = 0, size = 10;

        UserEntity friend1 = UserEntity.builder()
                .userId(2L)
                .fullName("Friend A")
                .email("a@example.com")
                .phone("0111111111")
                .avatarUrl("http://avatar1.jpg")
                .build();

        FriendshipEntity f1 = new FriendshipEntity();
        f1.setUser1(user);
        f1.setUser2(friend1);
        f1.setStatus(FriendshipStatus.accepted);
        f1.setCreatedAt(new Date());

        Page<FriendshipEntity> friendshipPage = new PageImpl<>(List.of(f1));

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(friendshipRepository.findAllByUser1UserIdAndStatusOrUser2UserIdAndStatus(
                eq(USER_ID), eq(FriendshipStatus.accepted), eq(USER_ID), eq(FriendshipStatus.accepted), any(Pageable.class)))
                .thenReturn(friendshipPage);

        // When
        Page<FriendResponse> result = userService.getFriends(request, page, size, sortDirection);

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Friend A");
    }

    @Test
    void getFriends_Success_WithMultipleFriends() {
        // Given
        int page = 0, size = 10;
        String sortDirection = "desc";

        UserEntity friend1 = UserEntity.builder()
                .userId(2L)
                .fullName("Friend A")
                .email("a@example.com")
                .phone("0111111111")
                .avatarUrl("http://avatar1.jpg")
                .build();

        UserEntity friend2 = UserEntity.builder()
                .userId(3L)
                .fullName("Friend B")
                .email("b@example.com")
                .phone("0222222222")
                .avatarUrl("http://avatar2.jpg")
                .build();

        FriendshipEntity f1 = new FriendshipEntity();
        f1.setUser1(user);
        f1.setUser2(friend1);
        f1.setStatus(FriendshipStatus.accepted);
        f1.setCreatedAt(new Date());

        FriendshipEntity f2 = new FriendshipEntity();
        f2.setUser1(friend2);
        f2.setUser2(user);
        f2.setStatus(FriendshipStatus.accepted);
        f2.setCreatedAt(new Date());

        Page<FriendshipEntity> friendshipPage = new PageImpl<>(List.of(f1, f2));

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(friendshipRepository.findAllByUser1UserIdAndStatusOrUser2UserIdAndStatus(
                eq(USER_ID), eq(FriendshipStatus.accepted), eq(USER_ID), eq(FriendshipStatus.accepted), any(Pageable.class)))
                .thenReturn(friendshipPage);

        // When
        Page<FriendResponse> result = userService.getFriends(request, page, size, sortDirection);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Friend A");
        assertThat(result.getContent().get(1).getFullName()).isEqualTo("Friend B");
        assertThat(result.getContent().get(0).getEmail()).isEqualTo("a@example.com");
        assertThat(result.getContent().get(1).getEmail()).isEqualTo("b@example.com");
    }

    @Test
    void getFriends_EmptyList() {
        // Given
        int page = 0, size = 10;
        String sortDirection = "desc";

        Page<FriendshipEntity> emptyPage = new PageImpl<>(Collections.emptyList());

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(friendshipRepository.findAllByUser1UserIdAndStatusOrUser2UserIdAndStatus(
                eq(USER_ID), eq(FriendshipStatus.accepted), eq(USER_ID), eq(FriendshipStatus.accepted), any(Pageable.class)))
                .thenReturn(emptyPage);

        // When
        Page<FriendResponse> result = userService.getFriends(request, page, size, sortDirection);

        // Then
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isEqualTo(0);
    }

    @Test
    void getFriends_ReverseFriendship_ReturnsCorrectFriend() {
        // Given
        int page = 0, size = 10;

        UserEntity friend = UserEntity.builder()
                .userId(2L)
                .fullName("Friend C")
                .email("c@example.com")
                .phone("0333333333")
                .avatarUrl("http://avatar3.jpg")
                .build();

        FriendshipEntity friendship = new FriendshipEntity();
        friendship.setUser1(friend); // Friend is user1
        friendship.setUser2(user);   // Current user is user2
        friendship.setStatus(FriendshipStatus.accepted);
        friendship.setCreatedAt(new Date());

        Page<FriendshipEntity> friendshipPage = new PageImpl<>(List.of(friendship));

        when(jwtService.extractUserId(TOKEN, TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(friendshipRepository.findAllByUser1UserIdAndStatusOrUser2UserIdAndStatus(
                eq(USER_ID), eq(FriendshipStatus.accepted), eq(USER_ID), eq(FriendshipStatus.accepted), any(Pageable.class)))
                .thenReturn(friendshipPage);

        // When
        Page<FriendResponse> result = userService.getFriends(request, page, size, "desc");

        // Then
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(2L);
        assertThat(result.getContent().get(0).getFullName()).isEqualTo("Friend C");
    }
}

