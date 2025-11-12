package vn.backend.backend.service;

import com.opencsv.*;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import vn.backend.backend.common.MemberRole;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.*;
import vn.backend.backend.model.*;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.Impl.GroupServiceImpl;

import java.io.StringReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock private GroupRepository groupRepository;
    @Mock private GroupMembersRepository groupMembersRepository;
    @Mock private UserRepository userRepository;
    @Mock private TransactionService transactionService;
    @Mock private UploadImageService uploadImageService;
    @Mock private BalanceService balanceService;
    @Mock private ExpenseRepository expenseRepository;
    @Mock private ExpenseParticipantRepository expenseParticipantRepository;
    @Mock private JwtService jwtService;
    @Mock private BalanceRepository balanceRepository;
    @Mock private PaymentRepository paymentRepository;

    @InjectMocks private GroupServiceImpl groupService;

    private UserEntity user;
    private GroupEntity group;
    private GroupMembersEntity adminMember;
    private final Long USER_ID = 1L;
    private final Long GROUP_ID = 100L;

    @BeforeEach
    void setUp() {
        user = UserEntity.builder()
                .userId(USER_ID)
                .fullName("Test User")
                .email("test@example.com")
                .build();

        group = GroupEntity.builder()
                .groupId(GROUP_ID)
                .groupName("Test Group")
                .description("Description")
                .defaultCurrency("USD")
                .createdBy(USER_ID)
                .isActive(true)
                .simplifyDebtOn(false)
                .build();

        adminMember = GroupMembersEntity.builder()
                .id(new GroupMembersId(GROUP_ID, USER_ID))
                .role(MemberRole.admin)
                .group(group)
                .member(user)
                .isActive(true)
                .build();

        group.setGroupMembers(new ArrayList<>(List.of(adminMember)));
        adminMember.setGroup(group);
    }

    @Test
    void createGroup_Success_WithImage() throws Exception {
        GroupCreateRequest request = new GroupCreateRequest("New Group", "Desc", "USD");
        MultipartFile file = new MockMultipartFile("file", "image.jpg", "image/jpeg", "test".getBytes());

        when(uploadImageService.uploadImage(file)).thenReturn("http://image.com/new.jpg");
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(groupRepository.save(any(GroupEntity.class))).thenAnswer(invocation -> {
            GroupEntity g = invocation.getArgument(0);
            g.setGroupId(GROUP_ID);
            return g;
        });

        GroupResponse response = groupService.createGroup(request, file, USER_ID);

        assertNotNull(response);
        assertEquals("New Group", response.getGroupName());
        assertEquals("http://image.com/new.jpg", response.getAvatarUrl());
        verify(groupRepository).save(any(GroupEntity.class));
        verify(groupMembersRepository).save(any(GroupMembersEntity.class));
        verify(transactionService).createTransaction(eq(GROUP_ID), eq(USER_ID), eq(ActionType.create), eq(EntityType.group), eq(GROUP_ID));
    }

    @Test
    void createGroup_Success_WithoutImage() throws Exception {
        GroupCreateRequest request = new GroupCreateRequest("New Group", "Desc", "USD");
        when(userRepository.findByUserId(USER_ID)).thenReturn(Optional.of(user));
        when(groupRepository.save(any(GroupEntity.class))).thenAnswer(i -> {
            GroupEntity g = i.getArgument(0);
            g.setGroupId(GROUP_ID);
            return g;
        });

        GroupResponse response = groupService.createGroup(request, null, USER_ID);

        assertNull(response.getAvatarUrl());
        verify(uploadImageService, never()).uploadImage(any());
    }

    @Test
    void editGroup_Success_UpdateNameAndImage() throws Exception {
        MockHttpServletRequest httpRequest = new MockHttpServletRequest();
        httpRequest.addHeader("Authorization", "Bearer valid-token");

        GroupEditRequest request = new GroupEditRequest("Updated Group", "New Desc", "EUR");
        MultipartFile file = new MockMultipartFile("file", "new.jpg", "image/jpeg", "data".getBytes());

        when(jwtService.extractUserId("valid-token", TokenType.ACCESS_TOKEN)).thenReturn(USER_ID);
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(GROUP_ID, USER_ID)).thenReturn(adminMember);
        when(uploadImageService.uploadImage(file)).thenReturn("http://newimage.com");

        GroupResponse response = groupService.editGroup(httpRequest, request, file, GROUP_ID);

        assertEquals("Updated Group", response.getGroupName());
        assertEquals("EUR", response.getDefaultCurrency());
        assertEquals("http://newimage.com", response.getAvatarUrl());
        verify(groupRepository).save(group);
    }

    @Test
    void editGroup_Fail_NotAdmin() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");
        adminMember.setRole(MemberRole.member);

        when(jwtService.extractUserId(anyString(), any())).thenReturn(USER_ID);
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(GROUP_ID, USER_ID)).thenReturn(adminMember);

        assertThrows(RuntimeException.class, () ->
                groupService.editGroup(req, new GroupEditRequest("Any", "Any", "USD"), null, GROUP_ID));
    }

    @Test
    void getAllGroupsByUserId_Success() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("joinedAt").descending());
        Page<GroupMembersEntity> page = new PageImpl<>(List.of(adminMember), pageable, 1);

        when(groupMembersRepository.findAllById_UserIdAndIsActiveTrue(eq(USER_ID), any(Pageable.class))).thenReturn(page);
        when(groupRepository.findByGroupId(anyLong())).thenReturn(Optional.of(group));

        Page<GroupResponse> result = groupService.getAllGroupsByUserId(USER_ID, 0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Group", result.getContent().get(0).getGroupName());
    }

    @Test
    void getGroupDetailById_Success() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("joinedAt").descending());
        Page<GroupMembersEntity> membersPage = new PageImpl<>(List.of(adminMember), pageable, 1);

        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(GROUP_ID, USER_ID)).thenReturn(adminMember);
        when(groupMembersRepository.findAllById_GroupIdAndIsActiveTrue(eq(GROUP_ID), any(Pageable.class))).thenReturn(membersPage);

        GroupDetailResponse response = groupService.getGroupDetailById(GROUP_ID, USER_ID, 0, 10);

        assertEquals(GROUP_ID, response.getGroupId());
        assertEquals(1, response.getTotalMembers());
        assertFalse(response.getSimplifyDebtOn());
    }

    @Test
    void deleteGroup_Success_WithConfirmation() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");

        when(jwtService.extractUserId(anyString(), any())).thenReturn(USER_ID);
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById(any(GroupMembersId.class))).thenReturn(Optional.of(adminMember));
        when(balanceService.checkGroupNetDebt(GROUP_ID)).thenReturn(true);

        String result = groupService.deleteGroup(GROUP_ID, req, true);

        assertEquals("Delete group id 100 successfully", result);
        assertFalse(group.getIsActive());
        verify(balanceRepository).deleteByGroup_GroupId(GROUP_ID);
        verify(expenseRepository).deleteByGroup_GroupId(GROUP_ID);
    }

    @Test
    void deleteGroup_Fail_NoConfirmation_WhenHasDebt() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");

        when(jwtService.extractUserId(anyString(), any())).thenReturn(USER_ID);
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById(any(GroupMembersId.class))).thenReturn(Optional.of(adminMember));
        when(balanceService.checkGroupNetDebt(GROUP_ID)).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.deleteGroup(GROUP_ID, req, false));
        assertTrue(ex.getMessage().contains("confirmation required"));
    }

    @Test
    void deleteMemberFromGroup_Success() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");
        Long memberToDeleteId = 2L;

        GroupMembersEntity memberToDelete = GroupMembersEntity.builder()
                .id(new GroupMembersId(GROUP_ID, memberToDeleteId))
                .role(MemberRole.member)
                .isActive(true)
                .build();

        when(jwtService.extractUserId(anyString(), any())).thenReturn(USER_ID);
        when(groupMembersRepository.findById(any(GroupMembersId.class)))
                .thenReturn(Optional.of(adminMember))
                .thenReturn(Optional.of(memberToDelete));
        when(balanceService.checkUserNetDebtInGroup(GROUP_ID, memberToDeleteId)).thenReturn(false);

        String result = groupService.deleteMemberFromGroup(GROUP_ID, memberToDeleteId, req);

        assertEquals("Delete member id 2 from group id 100 successfully", result);
        assertFalse(memberToDelete.getIsActive());
    }

    @Test
    void leaveGroup_Success() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");
        adminMember.setRole(MemberRole.member);

        when(jwtService.extractUserId(anyString(), any())).thenReturn(USER_ID);
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(GROUP_ID, USER_ID)).thenReturn(adminMember);
        when(balanceService.checkUserNetDebtInGroup(GROUP_ID, USER_ID)).thenReturn(false);

        String result = groupService.leaveGroup(GROUP_ID, req);

        assertEquals("User id 1 leave group id 100 successfully", result);
        assertFalse(adminMember.getIsActive());
    }

    @Test
    void leaveGroup_Fail_AdminCannotLeave() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.addHeader("Authorization", "Bearer token");

        when(jwtService.extractUserId(anyString(), any())).thenReturn(USER_ID);
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(GROUP_ID, USER_ID)).thenReturn(adminMember);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> groupService.leaveGroup(GROUP_ID, req));
        assertTrue(ex.getMessage().contains("Admin cannot leave"));
    }

    @Test
    void exportGroupReport_Success() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.extractUserId(anyString(), any())).thenReturn(USER_ID);
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(GROUP_ID, USER_ID)).thenReturn(adminMember);
        when(expenseRepository.findAllByGroupGroupIdAndDeletedAtIsNull(GROUP_ID)).thenReturn(List.of());
        when(paymentRepository.findAllByGroupGroupIdAndDeletedAtIsNull(GROUP_ID)).thenReturn(List.of());

        groupService.exportGroupReport(GROUP_ID, request, response);

        // Kiểm tra header
        String contentType = response.getContentType();
        assertNotNull(contentType);
        assertTrue(contentType.contains("application/vnd.ms-excel"));
        assertEquals("UTF-8", response.getCharacterEncoding());

        String contentDisposition = response.getHeader("Content-Disposition");
        assertNotNull(contentDisposition);
        assertTrue(contentDisposition.matches("attachment; filename=\"group_100_\\d{2}-\\d{2}-\\d{4}\\.csv\""));

        // Kiểm tra BOM
        byte[] content = response.getContentAsByteArray();
        assertTrue(content.length > 3);
        assertEquals((byte) 0xEF, content[0]);
        assertEquals((byte) 0xBB, content[1]);
        assertEquals((byte) 0xBF, content[2]);

        // Bỏ BOM và parse CSV đúng cách
        String csvContent = new String(Arrays.copyOfRange(content, 3, content.length), StandardCharsets.UTF_8);

        CSVParser parser = new CSVParserBuilder().withSeparator(',').withQuoteChar('"').build();
        CSVReader reader = new CSVReaderBuilder(new StringReader(csvContent))
                .withCSVParser(parser)
                .build();

        List<String[]> lines = reader.readAll();
        assertEquals(2, lines.size());

        // Dòng 1: Header
        String[] header = lines.get(0);
        assertEquals(6, header.length);
        assertEquals("Date", header[0]);
        assertEquals("Test User", header[5]); // CSVParser tự loại bỏ "

        // Dòng 2: Total balance
        String[] total = lines.get(1);
        assertEquals(6, total.length);
        assertEquals("", total[0]);
        assertEquals("Total balance", total[1]);
        assertEquals("", total[2]);
        assertEquals("", total[3]);
        assertEquals("USD", total[4]);
        assertEquals("0", total[5]);
    }

    @Test
    void uploadImageGroup_Success() throws Exception {
        MultipartFile file = new MockMultipartFile("file", "img.jpg", "image/jpeg", "data".getBytes());

        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(GROUP_ID, USER_ID)).thenReturn(adminMember);
        when(uploadImageService.uploadImage(file)).thenReturn("http://uploaded.com/img.jpg");

        String url = groupService.uploadImageGroup(file, GROUP_ID, USER_ID);

        assertEquals("http://uploaded.com/img.jpg", url);
        assertEquals("http://uploaded.com/img.jpg", group.getAvatarUrl());
        verify(groupRepository).save(group);
    }

    @Test
    void setSimplifyDebt_Success() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(GROUP_ID)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(GROUP_ID, USER_ID)).thenReturn(adminMember);

        groupService.setSimplifyDebt(GROUP_ID, USER_ID, true);

        assertTrue(group.getSimplifyDebtOn());
        verify(groupRepository).save(group);
    }
}