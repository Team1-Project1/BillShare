package vn.backend.backend.service.Impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.repository.FriendshipRepository;
import vn.backend.backend.service.FriendShipService;
@Service
@RequiredArgsConstructor
public class FriendShipServiceImpl implements FriendShipService {
    private final JwtServiceImpl jwtService;
    private final FriendshipRepository friendshipRepository;
    @Override
    public String acceptFriendRequest(String friendToken) {
        var claims = jwtService.decodeFriendRequestToken(friendToken);
        Long senderId = claims.getSenderId();
        Long receiverId = claims.getReceiverId();
        var friendship = friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                senderId, receiverId, receiverId, senderId
        );
        if (friendship == null) {
            return "Friend request not found or already processed!";
        }
        if (friendship.getStatus().equals(FriendshipStatus.accepted)) {
            return "You already accepted this friend request.";
        }
        if(friendship.getStatus().equals(FriendshipStatus.blocked)){
            return "You cannot interact with this user because they are blocked.";
        }
        friendship.setStatus(FriendshipStatus.accepted);
        friendshipRepository.save(friendship);
        return String.format("%s and %s are now friends!", friendship.getUser2().getFullName(), friendship.getUser1().getFullName());
    }

    @Override
    public String declineFriendRequest(String friendToken) {
        var claims = jwtService.decodeFriendRequestToken(friendToken);
        Long senderId = claims.getSenderId();
        Long receiverId = claims.getReceiverId();
        var friendship = friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                senderId, receiverId, receiverId, senderId
        );
        if (friendship == null) {
            return "Friend request not found or already processed!";
        }
        if (friendship.getStatus().equals(FriendshipStatus.accepted) ) {
            return "You already accepted this friend request. You can’t decline now.";
        }
        if(friendship.getStatus().equals(FriendshipStatus.blocked)){
            return "You cannot interact with this user because they are blocked.";
        }
        friendshipRepository.delete(friendship);
        return String.format("%s rejected %s's friend request!",
                friendship.getUser2().getFullName(), friendship.getUser1().getFullName());
    }

}
