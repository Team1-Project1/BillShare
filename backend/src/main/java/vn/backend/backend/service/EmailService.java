package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;

import java.io.IOException;

public interface EmailService {
    public void confirmParticipation(Long groupId, Long userId, ConfirmPaticipationRequest request) throws IOException;
    public String sendDebtReminderForGroup(Long groupId, HttpServletRequest req);
}
