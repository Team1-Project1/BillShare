package vn.backend.backend.service.Impl;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.common.MemberRole;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;
import vn.backend.backend.model.*;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.JwtService;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)// Quan trọng: tắt kiểm tra unnecessary stubbing
class EmailServiceTest {

    @Mock private SpringTemplateEngine templateEngine;
    @Mock private UserRepository userRepository;
    @Mock private GroupRepository groupRepository;
    @Mock private GroupMembersRepository groupMembersRepository;
    @Mock private JwtService jwtService;
    @Mock private BalanceRepository balanceRepository;
    @Mock private FriendshipRepository friendshipRepository;
    @Mock private ForgotPasswordRepository forgotPasswordRepository;
    @Mock private Gmail gmailService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private HttpServletRequest httpServletRequest;

    // Mock sâu cho Gmail API
    @Mock private Gmail.Users users;
    @Mock private Gmail.Users.Messages messages;
    @Mock private Gmail.Users.Messages.Send send;

    @InjectMocks private EmailServiceImpl emailService;

    private UserEntity sender, receiver;
    private GroupEntity group;
    private BalanceEntity balance;
    private final Long groupId = 1L;
    private final Long senderId = 100L;
    private final Long receiverId = 200L;
    private final String email = "receiver@test.com";
    private final String token = "valid-jwt-token";

    // Biến static để mock Base64 toàn cục
    private MockedStatic<org.apache.commons.codec.binary.Base64> mockedBase64;

    @BeforeEach
    void setUp() throws IOException {
        sender = UserEntity.builder().userId(senderId).fullName("Sender").email("sender@test.com").build();
        receiver = UserEntity.builder().userId(receiverId).fullName("Receiver").email(email).build();
        group = GroupEntity.builder().groupId(groupId).groupName("My Group").isActive(true).defaultCurrency("VND").build();
        balance = BalanceEntity.builder()
                .group(group)
                .user1(sender)
                .user2(receiver)
                .balance(BigDecimal.valueOf(-50000))
                .build();

        // === Mock chuỗi Gmail API ===
        when(gmailService.users()).thenReturn(users);
        when(users.messages()).thenReturn(messages);
        when(messages.send(eq("me"), any(Message.class))).thenReturn(send);

        // === Mock Base64 toàn cục ===
        mockedBase64 = mockStatic(org.apache.commons.codec.binary.Base64.class);
        mockedBase64.when(() -> org.apache.commons.codec.binary.Base64.encodeBase64URLSafeString(any(byte[].class)))
                .thenReturn("encoded-email-content");

        // THÊM DÒNG QUAN TRỌNG NÀY
        when(templateEngine.process(anyString(), any(Context.class)))
                .thenReturn("<html>Mocked email content</html>");
    }

    @AfterEach
    void tearDown() {
        if (mockedBase64 != null) {
            mockedBase64.close(); // Đóng mock static
        }
    }

    @Test
    @DisplayName("confirmParticipation - Gửi lời mời tham gia nhóm thành công")
    void confirmParticipation_success() throws Exception {
        ConfirmPaticipationRequest req = new ConfirmPaticipationRequest();
        req.setEmailTo(email);

        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(receiver));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, senderId))
                .thenReturn(GroupMembersEntity.builder().role(MemberRole.admin).build());
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, receiverId))
                .thenReturn(false);
        when(templateEngine.process(eq("sendGroupInvitations.html"), any())).thenReturn("<html>Invite</html>");

        emailService.confirmParticipation(groupId, senderId, req);

        verify(messages).send(eq("me"), any(Message.class));
    }

    @Test
    @DisplayName("sendDebtReminderForGroup - Gửi nhắc nợ thành công")
    void sendDebtReminderForGroup_success() throws Exception {
        when(httpServletRequest.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtService.extractUserId(token, TokenType.ACCESS_TOKEN)).thenReturn(senderId);
        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.of(group));
        when(userRepository.findById(receiverId)).thenReturn(Optional.of(receiver));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, senderId)).thenReturn(true);
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, receiverId)).thenReturn(true);
        when(balanceRepository.findByGroup_GroupIdAndUser1_UserIdAndUser2_UserIdOrGroup_GroupIdAndUser2_UserIdAndUser1_UserId(
                anyLong(), anyLong(), anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(balance);
        when(templateEngine.process(eq("sendDebtReminderNotice.html"), any())).thenReturn("<html>Debt</html>");

        String result = emailService.sendDebtReminderForGroup(groupId, receiverId, httpServletRequest);

        assertThat(result).contains("Sent debt reminder email");
        verify(messages).send(eq("me"), any(Message.class));
    }

    @Test
    @DisplayName("sendFriendRequest - Gửi lời mời kết bạn thành công")
    void sendFriendRequest_success() throws Exception {
        when(httpServletRequest.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtService.extractUserId(token, TokenType.ACCESS_TOKEN)).thenReturn(senderId);
        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(receiver));
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(anyLong(), anyLong(), anyLong(), anyLong()))
                .thenReturn(null);
        when(jwtService.generateFriendRequestToken(senderId, receiverId)).thenReturn("friend-token-123");
        when(templateEngine.process(eq("sendFriendRequest.html"), any())).thenReturn("<html>Friend</html>");

        String result = emailService.sendFriendRequest(email, httpServletRequest);

        assertThat(result).isEqualTo("friend-token-123");
        verify(friendshipRepository).save(any(FriendshipEntity.class));
        verify(messages).send(eq("me"), any(Message.class));
    }

    @Test
    @DisplayName("sendResetPasswordOTP - Gửi OTP thành công")
    void sendResetPasswordOTP_success() throws Exception {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(receiver));
        when(forgotPasswordRepository.findByUser(receiver)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-otp");
        when(templateEngine.process(eq("sendResetPassword.html"), any())).thenReturn("<html>OTP</html>");

        String result = emailService.sendResetPasswordOTP(email);

        assertThat(result).isEqualTo("If email exists, OTP has been sent.");
        verify(forgotPasswordRepository).save(any(ForgotPasswordEntity.class));
        verify(messages).send(eq("me"), any(Message.class));
    }

    @Test
    @DisplayName("sendResetPasswordOTP - Cooldown chưa đủ")
    void sendResetPasswordOTP_cooldown() throws Exception {
        ForgotPasswordEntity fp = new ForgotPasswordEntity();
        fp.setUser(receiver);
        fp.setLastRequestTime(LocalDateTime.now().minusSeconds(10));

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(receiver));
        when(forgotPasswordRepository.findByUser(receiver)).thenReturn(Optional.of(fp));

        // CƯỠNG ÉP set giá trị cooldownSeconds = 60
        Field cooldownField = EmailServiceImpl.class.getDeclaredField("cooldownSeconds");
        cooldownField.setAccessible(true);
        cooldownField.set(emailService, 60L); // 60 giây cooldown

        // Stub templateEngine để tránh NPE
        when(templateEngine.process(anyString(), any(Context.class)))
                .thenReturn("<html>any</html>");

        assertThatThrownBy(() -> emailService.sendResetPasswordOTP(email))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Please wait before requesting another OTP.");

        // Verify sendEmail KHÔNG được gọi
        verify(messages, never()).send(anyString(), any(Message.class));
    }

    @Test
    @DisplayName("sendEmail - Gửi email thành công (mock Gmail API)")
    void sendEmail_success() throws Exception {
        when(templateEngine.process(anyString(), any())).thenReturn("<html>Test</html>");

        emailService.sendEmail(email, "Test Subject", "template.html", Map.of("key", "value"));

        verify(messages).send(eq("me"), any(Message.class));
    }
}