package vn.backend.backend.service.Impl;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import vn.backend.backend.common.MemberRole;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;
import vn.backend.backend.model.GroupEntity;
import vn.backend.backend.model.GroupMembersEntity;
import vn.backend.backend.model.GroupMembersId;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.EmailService;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;


@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {
    private final SendGrid sendGrid;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMembersRepository groupMembersRepository;

    @Value("${spring.sendgrid.from-email}")
    private String emailFrom;
    @Value("${spring.sendgrid.name}")
    private String name;
    @Value("${spring.sendgrid.templateConfirmParticipationId}")
    private String templateConfirmParticipationId;
    @Value("${spring.sendgrid.baseUrl}")
    private String baseUrl;

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
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id " + groupId));
        GroupMembersEntity membership = groupMembersRepository
                .findById_GroupIdAndId_UserId(groupId, userId)
                .orElseThrow(() -> new NoSuchElementException("You is not a member of this group"));

        if (!MemberRole.admin.equals(membership.getRole())) {
            throw new AccessDeniedException("Only admins can confirm participation in this group");
        }
        boolean alreadyMember = groupMembersRepository.existsById(new GroupMembersId(groupId,receiver.getUserId()));
        if (alreadyMember) {
            throw new IllegalStateException("User " + receiver.getFullName() + " is already a member of group " + group.getGroupName());
        }

        Map<String, String> templateData = new HashMap<>();
        templateData.put("senderName", sender.getFullName());
        templateData.put("receiverName", receiver.getFullName());
        templateData.put("groupName", group.getGroupName());
        templateData.put("confirmationLink", baseUrl + groupId + "/confirm/" + receiver.getUserId());
        templateData.put("declineLink", baseUrl  + groupId + "/decline/" + receiver.getUserId());

        String subject = "Confirm your participation in group " + group.getGroupName();

        sendEmail(request.getEmailTo(), subject, templateConfirmParticipationId, templateData);
    }
}
