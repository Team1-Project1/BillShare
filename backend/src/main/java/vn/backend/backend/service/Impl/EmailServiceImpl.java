package vn.backend.backend.service.Impl;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.common.MemberRole;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;
import vn.backend.backend.model.*;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.EmailService;
import vn.backend.backend.service.JwtService;

import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Properties;


@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final SpringTemplateEngine templateEngine;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMembersRepository groupMembersRepository;
    private final JwtService jwtService;
    private final BalanceRepository balanceRepository;
    private final FriendshipRepository friendshipRepository;
    private final ForgotPasswordRepository forgotPasswordRepository;

    private final Gmail gmailService; // Gmail API Inject

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${spring.mail.from}") private String emailFrom;
    @Value("${spring.mail.name}") private String name;
    @Value("${spring.mail.baseUrlGroupMember}") private String baseUrlGroupMember;
    @Value("${spring.mail.baseUrlFriendShip}") private String baseUrlFriendShip;
    @Value("${app.otp.expiration.minutes}") private long otpExpiryMinutes;
    @Value("${app.otp.cooldown.seconds}") private long cooldownSeconds;


    public void sendEmail(String emailTo, String subject, String templateName, Map<String, Object> templateData)
            throws MessagingException, IOException {

        long startTime = System.currentTimeMillis(); // Bắt đầu tính thời gian

        Context context = new Context();
        context.setVariables(templateData);
        String htmlContent = templateEngine.process(templateName, context);

        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        MimeMessage email = new MimeMessage(session);

        email.setFrom(new InternetAddress(emailFrom, name, "UTF-8"));
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(emailTo));
        email.setSubject(subject, "UTF-8");
        email.setContent(htmlContent, "text/html; charset=UTF-8");

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);
        byte[] rawMessageBytes = buffer.toByteArray();

        String encodedEmail = org.apache.commons.codec.binary.Base64.encodeBase64URLSafeString(rawMessageBytes);

        Message gmailMessage = new Message();
        gmailMessage.setRaw(encodedEmail);

        gmailService.users().messages().send("me", gmailMessage).execute();

        long endTime = System.currentTimeMillis(); // ⏱️ Kết thúc
        long durationMs = endTime - startTime;
        double durationSec = durationMs / 1000.0;

        log.info(" Gmail API sent email to {} in {} ms (~{} seconds)", emailTo, durationMs, String.format("%.2f", durationSec));
    }



    // ================= XÁC NHẬN THAM GIA NHÓM =================
    @Override
    public void confirmParticipation(Long groupId, Long userId, ConfirmPaticipationRequest request)
            throws IOException, MessagingException {

        UserEntity sender = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id " + userId));

        UserEntity receiver = userRepository.findByEmail(request.getEmailTo())
                .orElseThrow(() -> new NoSuchElementException("User not found with email " + request.getEmailTo()));

        GroupEntity group = groupRepository.findByGroupIdAndIsActiveTrue(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id " + groupId));

        GroupMembersEntity membership = groupMembersRepository
                .findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId);

        if (membership == null || !MemberRole.admin.equals(membership.getRole())) {
            throw new RuntimeException("Only admins can confirm participation in this group");
        }

        boolean alreadyMember = groupMembersRepository
                .existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, receiver.getUserId());

        if (alreadyMember) {
            throw new IllegalStateException("User already a member of group " + group.getGroupName());
        }

        Map<String, Object> model = new HashMap<>();
        model.put("senderName", sender.getFullName());
        model.put("receiverName", receiver.getFullName());
        model.put("groupName", group.getGroupName());
        model.put("confirmationLink", baseUrlGroupMember + "confirm?groupId=" + groupId + "&userId=" + receiver.getUserId());
        model.put("declineLink", baseUrlGroupMember + "decline?groupId=" + receiver.getUserId());

        sendEmail(
                request.getEmailTo(),
                "Confirm your participation in group " + group.getGroupName(),
                "sendGroupInvitations.html",
                model
        );
    }

    // ================= GỬI EMAIL NHẮC NỢ TRONG NHÓM =================
    @Override
    public String sendDebtReminderForGroup(Long groupId, Long receiverId, HttpServletRequest req)
            throws IOException, MessagingException {

        String token = req.getHeader("Authorization").substring("Bearer ".length());
        Long userId = jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);

        UserEntity sender = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id " + userId));

        GroupEntity group = groupRepository.findByGroupIdAndIsActiveTrue(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found"));

        UserEntity receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id " + receiverId));

        Boolean membership = groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId);
        Boolean membershipOfReceiver = groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, receiverId);

        if (!membership || !membershipOfReceiver)
            throw new RuntimeException("Both users must be members of this group");

        BalanceEntity balance = balanceRepository
                .findByGroup_GroupIdAndUser1_UserIdAndUser2_UserIdOrGroup_GroupIdAndUser2_UserIdAndUser1_UserId(
                        groupId, userId, receiverId, groupId, userId, receiverId
                );

        if (balance == null || balance.getBalance().compareTo(BigDecimal.ZERO) == 0)
            return String.format("You have no debit records with %s in %s",
                    receiver.getFullName(), group.getGroupName());

        BigDecimal amount = balance.getBalance();
        Long debtorId, creditorId;

        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            debtorId = balance.getUser2().getUserId();
            creditorId = balance.getUser1().getUserId();
        } else {
            debtorId = balance.getUser1().getUserId();
            creditorId = balance.getUser2().getUserId();
        }

        if (!creditorId.equals(userId))
            throw new RuntimeException("You are not the creditor");

        Map<String, Object> model = new HashMap<>();
        model.put("senderName", sender.getFullName());
        model.put("receiverName", receiver.getFullName());
        model.put("groupName", group.getGroupName());
        model.put("amount", String.format("%,.0f", amount.abs()));
        model.put("currency", group.getDefaultCurrency());

        sendEmail(
                receiver.getEmail(),
                "Nhắc nợ trong nhóm " + group.getGroupName(),
                "sendDebtReminderNotice.html",
                model
        );

        return String.format("Sent debt reminder email to %s successfully", receiver.getFullName());
    }

    // ================= GỬI LỜI MỜI KẾT BẠN =================
    @Transactional
    @Override
    public String sendFriendRequest(String email, HttpServletRequest req)
            throws IOException, MessagingException {

        log.info("==> [SEND FRIEND REQUEST] Start processing friend request to email: {}", email);

        String token = req.getHeader("Authorization").substring("Bearer ".length());
        Long userId = jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);

        UserEntity sender = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id " + userId));

        UserEntity receiver = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found with email " + email));

        FriendshipEntity friendship = friendshipRepository
                .findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                        sender.getUserId(), receiver.getUserId(),
                        receiver.getUserId(), sender.getUserId()
                );

        if (friendship != null) {
            if (friendship.getStatus().equals(FriendshipStatus.pending))
                throw new RuntimeException("Friend request already pending");

            if (friendship.getStatus().equals(FriendshipStatus.accepted))
                throw new RuntimeException("Already friends,cand not send request again");
        }

        String friendToken = jwtService.generateFriendRequestToken(sender.getUserId(), receiver.getUserId());

        Map<String, Object> model = new HashMap<>();
        model.put("senderName", sender.getFullName());
        model.put("receiverName", receiver.getFullName());
        model.put("acceptLink", baseUrlFriendShip + "accept/" + friendToken);
        model.put("declineLink", baseUrlFriendShip + "decline/" + friendToken);

        sendEmail(
                email,
                "Confirm friend request from " + sender.getFullName(),
                "sendFriendRequest.html",
                model
        );

        friendshipRepository.save(FriendshipEntity.builder()
                .user1(sender)
                .user2(receiver)
                .status(FriendshipStatus.pending)
                .build());

        return friendToken;
    }

    @Override
    public String sendResetPasswordOTP(String email) throws IOException, MessagingException {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("email not found"));
        ForgotPasswordEntity fp = forgotPasswordRepository.findByUser(user).orElseGet(() -> {
            ForgotPasswordEntity newFp = new ForgotPasswordEntity();
            newFp.setUser(user);
            newFp.setRetryCount(0);
            return newFp;
        });
        LocalDateTime now = LocalDateTime.now();
        if (fp.getLastRequestTime() != null && fp.getLastRequestTime().isAfter(now.minusSeconds(cooldownSeconds))) {
            throw new RuntimeException("Please wait before requesting another OTP.");
        }
        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        String otpHash = passwordEncoder.encode(otp);

        fp.setOtpHash(otpHash);
        fp.setExpirationTime(now.plusMinutes(otpExpiryMinutes));
        fp.setLastRequestTime(now);
        fp.setRetryCount(0);

        forgotPasswordRepository.save(fp);

        Map<String, Object> model = new HashMap<>();
        model.put("userName", user.getFullName());
        model.put("otpCode", otp);
        model.put("expirationTime",otpExpiryMinutes );
        sendEmail(
                email,
                "Yều cầu đặt lại mật khẩu cho người dùng : " + user.getFullName(),
                "sendResetPassword.html",
                model
        );
        return "If email exists, OTP has been sent.";
    }
}
