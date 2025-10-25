package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;

public interface FriendShipService {
    String acceptFriendRequest(HttpServletRequest req,String friendToken);
    String declineFriendRequest(HttpServletRequest req,String friendToken);
}
