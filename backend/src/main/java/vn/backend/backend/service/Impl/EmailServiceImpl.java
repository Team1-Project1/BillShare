package vn.backend.backend.service.Impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.common.MemberRole;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;
import vn.backend.backend.model.*;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.EmailService;
import vn.backend.backend.service.JwtService;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;


@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {
    private final SendGrid sendGrid;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMembersRepository groupMembersRepository;
    private final JwtService jwtService;
    private final BalanceRepository balanceRepository;
    private final FriendshipRepository friendshipRepository;

    @Value("${spring.sendgrid.from-email}")
    private String emailFrom;
    @Value("${spring.sendgrid.name}")
    private String name;
    @Value("${spring.sendgrid.templateConfirmParticipationId}")
    private String templateConfirmParticipationId;
    @Value("${spring.sendgrid.templateSendDebtReminder}")
    private String templateSendDebtReminder;
    @Value("${spring.sendgrid.templateSendFriendRequest}")
    private String templateSendFriendRequest;
    @Value("${spring.sendgrid.baseUrlGroupMember}")
    private String baseUrlGroupMember;
    @Value("${spring.sendgrid.baseUrlFriendShip}")
    private String baseUrlFriendShip;

    private void sendEmail(String emailTo, String subject, String templateId, Map<String, String> templateData) throws IOException {
        Email fromEmail = new Email(emailFrom, name);
        Email toEmail = new Email(emailTo);

        Mail mail = new Mail();
        mail.setFrom(fromEmail);

        Personalization personalization = new Personalization();
        personalization.addTo(toEmail);
        personalization.setSubject(subject);
        templateData.forEach(personalization::addDynamicTemplateData);
        mail.addPersonalization(personalization);
        mail.setTemplateId(templateId);

        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sendGrid.api(request);
        if (response.getStatusCode() == 202) {
            log.info("Email sent to {} with subject {}", emailTo, subject);
        } else {
            log.error("Failed to send email to {}. Status: {}, Body: {}", emailTo, response.getStatusCode(), response.getBody());
        }
    }
    @Override
    public void confirmParticipation(Long groupId, Long userId, ConfirmPaticipationRequest request) throws IOException {
        UserEntity sender = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id " + userId));
        UserEntity receiver = userRepository.findByEmail(request.getEmailTo())
                .orElseThrow(() -> new NoSuchElementException("User not found with email " + request.getEmailTo()));
        GroupEntity group = groupRepository.findByGroupIdAndIsActiveTrue(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id " + groupId));
        GroupMembersEntity membership = groupMembersRepository
                .findById_GroupIdAndId_UserId(groupId, userId)
                .orElseThrow(() -> new NoSuchElementException("You is not a member of this group"));

        if (!MemberRole.admin.equals(membership.getRole())) {
            throw new AccessDeniedException("Only admins can confirm participation in this group");
        }
        boolean alreadyMember = groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId,receiver.getUserId());
        if (alreadyMember) {
            throw new IllegalStateException("User " + receiver.getFullName() + " is already a member of group " + group.getGroupName());
        }

        Map<String, String> templateData = new HashMap<>();
        templateData.put("senderName", sender.getFullName());
        templateData.put("receiverName", receiver.getFullName());
        templateData.put("groupName", group.getGroupName());
        templateData.put("confirmationLink", baseUrlGroupMember + "confirm?groupId=" + groupId + "&userId=" + receiver.getUserId());
        templateData.put("declineLink", baseUrlGroupMember + "decline?groupId=" + groupId + "&userId=" + receiver.getUserId());

        String subject = "Confirm your participation in group " + group.getGroupName();

        sendEmail(request.getEmailTo(), subject, templateConfirmParticipationId, templateData);
    }

    @Override
    public String sendDebtReminderForGroup(Long groupId, HttpServletRequest req) {
        String token=req.getHeader("Authorization").substring("Bearer ".length());
        Long userId=jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id " + userId));
        GroupEntity group = groupRepository.findByGroupIdAndIsActiveTrue(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id " + groupId));
        Boolean membership = groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId,userId);
        if (!membership) {
            throw new AccessDeniedException("You are not a member of this group");
        }
        List<BalanceEntity>balances=balanceRepository.findAllByGroup_GroupIdAndUser1_UserIdOrGroup_GroupIdAndUser2_UserId(groupId, userId, groupId, userId);
        if (balances.isEmpty()) {
            return String.format("You have no debit records in group %s,you cannot send debt reminder emails", group.getGroupName());
        }
        int emailSentCount = 0;
        for(var balance:balances){
            BigDecimal amount = balance.getBalance();
            if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) continue;
            Long debtorId, creditorId;
            if(amount.compareTo(BigDecimal.ZERO) < 0){
                debtorId = balance.getUser2().getUserId();
                creditorId = balance.getUser1().getUserId();
            } else {
                debtorId = balance.getUser1().getUserId();
                creditorId = balance.getUser2().getUserId();
            }
            log.info("Processing balance: debtorId={}, creditorId={}, amount={}", debtorId, creditorId, amount);
            if(creditorId.equals(userId)){
                UserEntity debtor = userRepository.findById(debtorId)
                        .orElseThrow(() -> new NoSuchElementException("User not found with id " + debtorId));
                Map<String, String> templateData = new HashMap<>();
                String subject = "Nhắc nợ trong nhóm " + group.getGroupName();
                templateData.put("senderName", user.getFullName());
                templateData.put("receiverName",debtor.getFullName());
                templateData.put("groupName", group.getGroupName());
                templateData.put("amount", String.format("%,.0f", amount.abs()));
                templateData.put("currency", group.getDefaultCurrency());
                try {
                    sendEmail(debtor.getEmail(), subject, templateSendDebtReminder, templateData);
                    emailSentCount++;
                } catch (IOException e) {
                    return String.format("Failed to send debt reminder email to %s", debtor.getEmail());
                }
            }

        }
        if (emailSentCount > 0) {
            return String.format(" Sent %d debt reminder emails to %s group members",
                    emailSentCount, group.getGroupName());
        } else {
            return String.format("No one owes you anything in group %s,you cannot send debt reminder emails", group.getGroupName());
        }
    }
    @Transactional
    @Override
    public String sendFriendRequest(String email, HttpServletRequest req) throws IOException {
        log.info("==> [SEND FRIEND REQUEST] Start processing friend request to email: {}", email);

        // Lấy token từ header
        String token = req.getHeader("Authorization").substring("Bearer ".length());
        Long userId = jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        log.debug("Extracted userId {} from JWT token", userId);

        // Tìm người gửi
        UserEntity sender = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with id {}", userId);
                    return new NoSuchElementException("User not found with id " + userId);
                });
        log.info("Sender found: {} (ID: {})", sender.getFullName(), sender.getUserId());

        // Tìm người nhận
        UserEntity receiver = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email {}", email);
                    return new NoSuchElementException("User not found with email " + email);
                });
        log.info("Receiver found: {} (ID: {})", receiver.getFullName(), receiver.getUserId());

        // Kiểm tra trạng thái bạn bè hiện tại
        FriendshipEntity isFriend = friendshipRepository
                .findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                        sender.getUserId(), receiver.getUserId(),
                        receiver.getUserId(), sender.getUserId()
                );

        if (isFriend != null) {
            log.info("Existing friendship record found between {} and {}. Status: {}",
                    sender.getFullName(), receiver.getFullName(), isFriend.getStatus());

            if (isFriend.getStatus().equals(FriendshipStatus.pending)) {
                long diffMillis = new Date().getTime() - isFriend.getCreatedAt().getTime();
                long hours = diffMillis / (1000 * 60 * 60);
                log.debug("Friend request pending for {} hours", hours);

                if (hours >= 24) {
                    friendshipRepository.delete(isFriend);
                    log.info("Previous friend request from {} to {} expired ({} hours) and deleted.",
                            sender.getFullName(), receiver.getFullName(), hours);
                } else {
                    log.warn("Duplicate friend request attempt from {} to {} within 24 hours.",
                            sender.getFullName(), receiver.getFullName());
                    return String.format("You have already sent a friend request to %s, you cannot send email",
                            receiver.getFullName());
                }
            } else if (isFriend.getStatus().equals(FriendshipStatus.accepted)) {
                log.warn("Friend request not sent: {} and {} are already friends.",
                        sender.getFullName(), receiver.getFullName());
                return String.format("You are already friends with %s, you cannot send email",
                        receiver.getFullName());
            } else {
                log.warn("Friend request blocked: {} has been blocked by {}.",
                        sender.getFullName(), receiver.getFullName());
                return String.format("You have been blocked by %s, you cannot send email",
                        receiver.getFullName());
            }
        }

        // Tạo token kết bạn
        String friendToken = jwtService.generateFriendRequestToken(sender.getUserId(), receiver.getUserId());
        log.debug("Generated friend token: {}", friendToken);

        // Tạo dữ liệu template
        Map<String, String> templateData = new HashMap<>();
        templateData.put("senderName", sender.getFullName());
        templateData.put("receiverName", receiver.getFullName());
        templateData.put("acceptLink", baseUrlFriendShip + "accept/" + friendToken);
        templateData.put("declineLink", baseUrlFriendShip + "decline/" + friendToken);

        String subject = "Confirm friend request of " + sender.getFullName();

        // Gửi email
        log.info("Sending friend request email from {} to {}", sender.getEmail(), receiver.getEmail());
        sendEmail(email, subject, templateSendFriendRequest, templateData);
        log.info("Email sent successfully to {}", receiver.getEmail());

        // Lưu vào DB
        friendshipRepository.save(FriendshipEntity.builder()
                .user1(sender)
                .user2(receiver)
                .status(FriendshipStatus.pending)
                .build());
        log.info("Friendship entity saved: {} → {} (status: PENDING)",
                sender.getFullName(), receiver.getFullName());

        log.info("<== [SEND FRIEND REQUEST] Friend request sent successfully to {}", receiver.getFullName());
        return String.format("Friend request sent successfully to %s", receiver.getFullName());
    }

}
