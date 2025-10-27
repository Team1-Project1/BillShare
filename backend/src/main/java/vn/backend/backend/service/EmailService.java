package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;

import java.io.IOException;

public interface EmailService {
    public void confirmParticipation(Long groupId, Long userId, ConfirmPaticipationRequest request) throws IOException;
    public String sendDebtReminderForGroup(Long groupId,Long receiverId, HttpServletRequest req) throws IOException;
    public String sendFriendRequest(String email, HttpServletRequest req) throws IOException;
}
