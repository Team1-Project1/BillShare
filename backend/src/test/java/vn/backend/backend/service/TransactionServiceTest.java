package vn.backend.backend.service.Impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import vn.backend.backend.controller.response.TransactionResponse;
import vn.backend.backend.model.GroupEntity;
import vn.backend.backend.model.TransactionEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.TransactionRepository;
import vn.backend.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionServiceImpl Tests")
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GroupMembersRepository groupMembersRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private GroupEntity group;
    private UserEntity user;
    private TransactionEntity transaction;
    private TransactionResponse response;

    @BeforeEach
    void setUp() {
        group = new GroupEntity();
        group.setGroupId(10L);
        group.setGroupName("Test Group");

        user = new UserEntity();
        user.setUserId(100L);
        user.setFullName("John Doe");

        transaction = TransactionEntity.builder()
                .transactionId(1L)
                .group(group)
                .user(user)
                .actionType(ActionType.create)
                .entityType(EntityType.expense)
                .entityId(999L)
                .timestamp(new Date())
                .build();

        response = TransactionResponse.builder()
                .transactionId(1L)
                .groupId(10L)
                .groupName("Test Group")
                .userId(100L)
                .userName("John Doe")
                .actionType(ActionType.create)
                .entityType(EntityType.expense)
                .entityId(999L)
                .timestamp(transaction.getTimestamp())
                .build();
    }

    // ========================= CREATE TRANSACTION =========================

    @Test
    @DisplayName("createTransaction - Success")
    void createTransaction_success() {
        // Given
        when(groupRepository.findByGroupId(10L)).thenReturn(Optional.of(group));
        when(userRepository.findByUserId(100L)).thenReturn(Optional.of(user));
        when(transactionRepository.save(any(TransactionEntity.class))).thenReturn(transaction);

        // When
        TransactionResponse result = transactionService.createTransaction(
                10L, 100L, ActionType.create, EntityType.expense, 999L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getTransactionId());
        assertEquals("Test Group", result.getGroupName());
        assertEquals("John Doe", result.getUserName());
        assertEquals(ActionType.create, result.getActionType());

        verify(groupRepository).findByGroupId(10L);
        verify(userRepository).findByUserId(100L);
        verify(transactionRepository).save(any(TransactionEntity.class));
    }

    @Test
    @DisplayName("createTransaction - Group not found")
    void createTransaction_groupNotFound() {
        when(groupRepository.findByGroupId(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                transactionService.createTransaction(999L, 100L, ActionType.create, EntityType.expense, 1L));

        assertEquals("Group not found", exception.getMessage());
        verify(groupRepository).findByGroupId(999L);
        verify(userRepository, never()).findByUserId(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("createTransaction - User not found")
    void createTransaction_userNotFound() {
        when(groupRepository.findByGroupId(10L)).thenReturn(Optional.of(group));
        when(userRepository.findByUserId(999L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                transactionService.createTransaction(10L, 999L, ActionType.create, EntityType.expense, 1L));

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findByUserId(999L);
        verify(transactionRepository, never()).save(any());
    }

    // ========================= GET TRANSACTIONS BY GROUP ID =========================

    @Test
    @DisplayName("getTransactionsByGroupId - Returns page with data")
    void getTransactionsByGroupId_returnsPageWithData() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("timestamp").descending());
        Page<TransactionResponse> mockPage = new PageImpl<>(List.of(response), pageable, 1);

        when(transactionRepository.findTransactionsByUserActiveGroups(100L, pageable))
                .thenReturn(mockPage);

        Page<TransactionResponse> result = transactionService.getTransactionsByGroupId(100L, pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("John Doe", result.getContent().get(0).getUserName());
        assertEquals("Test Group", result.getContent().get(0).getGroupName());

        verify(transactionRepository).findTransactionsByUserActiveGroups(100L, pageable);
    }

    @Test
    @DisplayName("getTransactionsByGroupId - Returns empty page")
    void getTransactionsByGroupId_returnsEmptyPage() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<TransactionResponse> emptyPage = Page.empty(pageable);

        when(transactionRepository.findTransactionsByUserActiveGroups(200L, pageable))
                .thenReturn(emptyPage);

        Page<TransactionResponse> result = transactionService.getTransactionsByGroupId(200L, pageable);

        assertTrue(result.isEmpty());
        assertEquals(0, result.getTotalElements());
        verify(transactionRepository).findTransactionsByUserActiveGroups(200L, pageable);
    }

    @Test
    @DisplayName("getTransactionsByGroupId - Repository returns null page (defensive test)")
    void getTransactionsByGroupId_repositoryReturnsNull() {
        Pageable pageable = PageRequest.of(0, 10);

        when(transactionRepository.findTransactionsByUserActiveGroups(300L, pageable))
                .thenReturn(null);

        Page<TransactionResponse> result = transactionService.getTransactionsByGroupId(300L, pageable);

        // Service hiện tại trả thẳng → nếu repo trả null → result = null
        // Test này kiểm tra hành vi hiện tại (không crash)
        assertNull(result);
    }
}