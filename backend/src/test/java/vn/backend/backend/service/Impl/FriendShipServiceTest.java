package vn.backend.backend.service.Impl;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.model.FriendshipEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.FriendshipRepository;
import vn.backend.backend.controller.request.FriendClaimsRequest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FriendShipServiceImpl Tests")
class FriendShipServiceImplTest {

    @Mock
    private JwtServiceImpl jwtService;

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private FriendShipServiceImpl friendShipService;

    private UserEntity sender;
    private UserEntity receiver;
    private FriendshipEntity friendship;
    private final String friendToken = "valid-friend-token";

    @BeforeEach
    void setUp() {
        sender = new UserEntity();
        sender.setUserId(1L);
        sender.setFullName("Sender Name");

        receiver = new UserEntity();
        receiver.setUserId(2L);
        receiver.setFullName("Receiver Name");

        friendship = new FriendshipEntity();
        friendship.setUser1(sender);
        friendship.setUser2(receiver);
        friendship.setStatus(FriendshipStatus.pending);
    }

    // ====================== ACCEPT FRIEND REQUEST ======================

    @Test
    @DisplayName("Accept friend request - Success")
    void acceptFriendRequest_success() {
        // given
        when(jwtService.decodeFriendRequestToken(friendToken))
                .thenReturn(new FriendClaimsRequest(1L, 2L));

        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                eq(1L), eq(2L), eq(2L), eq(1L)))
                .thenReturn(friendship);

        // when
        String result = friendShipService.acceptFriendRequest(request, friendToken);

        // then
        assertEquals("Receiver Name and Sender Name are now friends!", result);
        assertEquals(FriendshipStatus.accepted, friendship.getStatus());
        verify(friendshipRepository).save(friendship);
    }

    @Test
    @DisplayName("Accept friend request - Already accepted")
    void acceptFriendRequest_alreadyAccepted() {
        friendship.setStatus(FriendshipStatus.accepted);

        when(jwtService.decodeFriendRequestToken(friendToken))
                .thenReturn(new FriendClaimsRequest(1L, 2L));
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(friendship);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> friendShipService.acceptFriendRequest(request, friendToken));

        assertEquals("You already accepted this friend request.", exception.getMessage());
        verify(friendshipRepository, never()).save(any());
    }

    @Test
    @DisplayName("Accept friend request - Blocked")
    void acceptFriendRequest_blocked() {
        friendship.setStatus(FriendshipStatus.blocked);

        when(jwtService.decodeFriendRequestToken(friendToken))
                .thenReturn(new FriendClaimsRequest(1L, 2L));
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(friendship);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> friendShipService.acceptFriendRequest(request, friendToken));

        assertEquals("You cannot interact with this user because they are blocked.", exception.getMessage());
    }

    @Test
    @DisplayName("Accept friend request - Not found")
    void acceptFriendRequest_notFound() {
        when(jwtService.decodeFriendRequestToken(friendToken))
                .thenReturn(new FriendClaimsRequest(1L, 2L));
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> friendShipService.acceptFriendRequest(request, friendToken));

        assertEquals("Friend request not found or already processed!", exception.getMessage());
    }

    // ====================== DECLINE FRIEND REQUEST ======================

    @Test
    @DisplayName("Decline friend request - Success")
    void declineFriendRequest_success() {
        when(jwtService.decodeFriendRequestToken(friendToken))
                .thenReturn(new FriendClaimsRequest(1L, 2L));
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(friendship);

        String result = friendShipService.declineFriendRequest(request, friendToken);

        assertEquals("Receiver Name rejected Sender Name's friend request!", result);
        verify(friendshipRepository).delete(friendship);
    }

    @Test
    @DisplayName("Decline friend request - Already accepted")
    void declineFriendRequest_alreadyAccepted() {
        friendship.setStatus(FriendshipStatus.accepted);

        when(jwtService.decodeFriendRequestToken(friendToken))
                .thenReturn(new FriendClaimsRequest(1L, 2L));
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(friendship);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> friendShipService.declineFriendRequest(request, friendToken));

        assertEquals("You already accepted this friend request. You can’t decline now.", exception.getMessage());
        verify(friendshipRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Decline friend request - Blocked")
    void declineFriendRequest_blocked() {
        friendship.setStatus(FriendshipStatus.blocked);

        when(jwtService.decodeFriendRequestToken(friendToken))
                .thenReturn(new FriendClaimsRequest(1L, 2L));
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(friendship);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> friendShipService.declineFriendRequest(request, friendToken));

        assertEquals("You cannot interact with this user because they are blocked.", exception.getMessage());
    }

    @Test
    @DisplayName("Decline friend request - Not found")
    void declineFriendRequest_notFound() {
        when(jwtService.decodeFriendRequestToken(friendToken))
                .thenReturn(new FriendClaimsRequest(1L, 2L));
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(null);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> friendShipService.declineFriendRequest(request, friendToken));

        assertEquals("Friend request not found or already processed!", exception.getMessage());
    }
}