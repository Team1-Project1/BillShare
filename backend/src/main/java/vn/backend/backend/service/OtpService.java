package vn.backend.backend.service;

import vn.backend.backend.controller.request.ChangePasswordRequest;

public interface OtpService {
     String verifyOtp(String email, String otp);
     String resetPassword(String token, ChangePasswordRequest request);
}
