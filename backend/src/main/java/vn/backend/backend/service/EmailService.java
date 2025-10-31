package vn.backend.backend.service;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

public interface EmailService {
    public void confirmParticipation(Long groupId, Long userId, ConfirmPaticipationRequest request) throws IOException, MessagingException;
    public String sendDebtReminderForGroup(Long groupId,Long receiverId, HttpServletRequest req) throws IOException, MessagingException;
    public String sendFriendRequest(String email, HttpServletRequest req) throws IOException, MessagingException;
    public String sendResetPasswordOTP(String email) throws MessagingException, UnsupportedEncodingException;

}
