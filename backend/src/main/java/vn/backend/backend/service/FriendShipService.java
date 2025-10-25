package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;

public interface FriendShipService {
    String acceptFriendRequest(String friendToken);
    String declineFriendRequest(String friendToken);
}
