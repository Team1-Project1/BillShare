package vn.backend.backend.service.Impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import vn.backend.backend.common.SplitMethod;
import vn.backend.backend.controller.request.CreateExpenseRequest;
import vn.backend.backend.controller.request.UpdateExpenseRequest;
import vn.backend.backend.controller.response.ExpenseDetailResponse;
import vn.backend.backend.controller.response.ExpenseResponse;
import vn.backend.backend.controller.response.ExpenseSimpleResponse;
import vn.backend.backend.model.*;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.BalanceService;
import vn.backend.backend.service.ExpenseParticipantService;
import vn.backend.backend.service.TransactionService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ExpenseParticipantService expenseParticipantService;

    @Mock
    private BalanceService balanceService;

    @Mock
    private TransactionService transactionService;

    @Mock
    private GroupMembersRepository groupMembersRepository;

    @Mock
    private ExpenseParticipantRepository expenseParticipantRepository;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private GroupEntity testGroup;
    private UserEntity testUser;
    private UserEntity payerUser;
    private CategoryEntity testCategory;
    private ExpenseEntity testExpense;
    private CreateExpenseRequest createRequest;
    private UpdateExpenseRequest updateRequest;

    @BeforeEach
    void setUp() {
        // Setup test data
        testGroup = GroupEntity.builder()
                .groupId(1L)
                .groupName("Test Group")
                .defaultCurrency("VND")
                .build();

        testUser = UserEntity.builder()
                .userId(1L)
                .fullName("Test User")
                .email("test@example.com")
                .build();

        payerUser = UserEntity.builder()
                .userId(2L)
                .fullName("Payer User")
                .email("payer@example.com")
                .build();

        testCategory = CategoryEntity.builder()
                .categoryId(1L)
                .categoryName("Food")
                .build();

        testExpense = ExpenseEntity.builder()
                .expenseId(1L)
                .group(testGroup)
                .expenseName("Test Expense")
                .totalAmount(new BigDecimal("100000"))
                .currency("VND")
                .category(testCategory)
                .expenseDate(new Date())
                .description("Test Description")
                .createdBy(testUser)
                .payer(payerUser)
                .splitMethod(SplitMethod.equal)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        // Setup CreateExpenseRequest
        CreateExpenseRequest.ParticipantShareRequest participant1 =
                new CreateExpenseRequest.ParticipantShareRequest(1L, new BigDecimal("50000"));
        CreateExpenseRequest.ParticipantShareRequest participant2 =
                new CreateExpenseRequest.ParticipantShareRequest(2L, new BigDecimal("50000"));

        createRequest = CreateExpenseRequest.builder()
                .groupId(1L)
                .expenseName("Test Expense")
                .totalAmount(new BigDecimal("100000"))
                .categoryId(1L)
                .expenseDate(new Date())
                .description("Test Description")
                .payerId(2L)
                .splitMethod(SplitMethod.equal)
                .participants(Arrays.asList(participant1, participant2))
                .build();

        // Setup UpdateExpenseRequest
        UpdateExpenseRequest.ParticipantShareRequest updateParticipant =
                new UpdateExpenseRequest.ParticipantShareRequest(1L, new BigDecimal("100000"));

        updateRequest = UpdateExpenseRequest.builder()
                .expenseName("Updated Expense")
                .totalAmount(new BigDecimal("100000"))
                .categoryId(1L)
                .expenseDate(new Date())
                .description("Updated Description")
                .payerId(2L)
                .splitMethod(SplitMethod.equal)
                .participants(Collections.singletonList(updateParticipant))
                .build();
    }

    @Test
    void createExpense_Success() {
        // Given
        when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(testGroup));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(anyLong(), anyLong()))
                .thenReturn(true);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(payerUser));
        when(expenseRepository.save(any(ExpenseEntity.class))).thenReturn(testExpense);

        ExpenseParticipantEntity participantEntity = ExpenseParticipantEntity.builder()
                .participantId(1L)
                .expense(testExpense)
                .user(testUser)
                .shareAmount(new BigDecimal("50000"))
                .build();

        when(expenseParticipantService.addParticipant(anyLong(), anyLong(), any(BigDecimal.class)))
                .thenReturn(participantEntity);

        // When
        ExpenseDetailResponse response = expenseService.createExpense(1L, createRequest, 1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getExpenseId());
        assertEquals("Test Expense", response.getExpenseName());
        assertEquals(new BigDecimal("100000"), response.getTotalAmount());
        assertEquals(2, response.getTotalParticipants());

        verify(expenseRepository, times(1)).save(any(ExpenseEntity.class));
        verify(balanceService, times(1)).updateBalancesForExpense(any(), anyList());
        verify(transactionService, times(1)).createTransaction(
                eq(1L), eq(1L), eq(ActionType.create), eq(EntityType.expense), eq(1L)
        );
    }

    @Test
    void createExpense_GroupNotFound_ThrowsException() {
        // Given
        when(groupRepository.findByGroupId(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.createExpense(1L, createRequest, 1L));

        assertTrue(exception.getMessage().contains("Không tìm thấy nhóm"));
        verify(expenseRepository, never()).save(any());
    }

    @Test
    void createExpense_GroupIdMismatch_ThrowsException() {
        // Given
        createRequest.setGroupId(2L); // Different from path parameter
        when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(testGroup));

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                expenseService.createExpense(1L, createRequest, 1L));

        assertTrue(exception.getMessage().contains("không khớp"));
    }

    @Test
    void createExpense_CreatorNotInGroup_ThrowsException() {
        // Given
        when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(testGroup));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.createExpense(1L, createRequest, 1L));

        assertTrue(exception.getMessage().contains("không phải là thành viên"));
    }

    @Test
    void createExpense_PayerNotInGroup_ThrowsException() {
        // Given
        when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(testGroup));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(true);
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 2L))
                .thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.createExpense(1L, createRequest, 1L));

        assertTrue(exception.getMessage().contains("Người trả tiền không phải là thành viên"));
    }

    @Test
    void deleteExpense_Success() {
        // Given
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(testExpense));
        when(expenseParticipantService.getParticipantsByExpenseId(1L))
                .thenReturn(Collections.emptyList());

        // When
        expenseService.deleteExpense(1L, 1L, 1L);

        // Then
        assertNotNull(testExpense.getDeletedAt());
        verify(expenseRepository, times(1)).save(testExpense);
        verify(balanceService, times(1)).updateBalancesAfterExpenseDeletion(
                eq(1L), eq(2L), anyList()
        );
        verify(transactionService, times(1)).createTransaction(
                eq(1L), eq(1L), eq(ActionType.delete), eq(EntityType.expense), eq(1L)
        );
    }

    @Test
    void deleteExpense_ExpenseNotFound_ThrowsException() {
        // Given
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.deleteExpense(1L, 1L, 1L));

        assertTrue(exception.getMessage().contains("not found"));
        verify(expenseRepository, never()).save(any());
    }

    @Test
    void deleteExpense_NotCreator_ThrowsException() {
        // Given
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(testExpense));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.deleteExpense(1L, 999L, 1L)); // Different user ID

        assertTrue(exception.getMessage().contains("Only the creator can delete"));
        verify(expenseRepository, never()).save(any());
    }

    @Test
    void getExpensesByGroupId_Success() {
        // Given
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(true);
        when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(testGroup));

        Page<ExpenseEntity> expensePage = new PageImpl<>(Collections.singletonList(testExpense));
        when(expenseRepository.findAllByGroupGroupIdAndDeletedAtIsNull(
                eq(1L), any(Pageable.class))).thenReturn(expensePage);

        // When
        Page<ExpenseResponse> result = expenseService.getExpensesByGroupId(1L, 1L, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Expense", result.getContent().get(0).getExpenseName());
        verify(expenseRepository, times(1)).findAllByGroupGroupIdAndDeletedAtIsNull(
                eq(1L), any(Pageable.class));
    }

    @Test
    void getExpensesByGroupId_UserNotInGroup_ThrowsException() {
        // Given
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.getExpensesByGroupId(1L, 1L, 0, 10));

        assertTrue(exception.getMessage().contains("Không phải là thành viên"));
    }

    @Test
    void getExpenseDetail_Success() {
        // Given
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(true);
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(testExpense));

        ExpenseParticipantEntity participant = ExpenseParticipantEntity.builder()
                .participantId(1L)
                .expense(testExpense)
                .user(testUser)
                .shareAmount(new BigDecimal("50000"))
                .build();

        when(expenseParticipantService.getParticipantsByExpenseId(1L))
                .thenReturn(Collections.singletonList(participant));

        // When
        ExpenseDetailResponse result = expenseService.getExpenseDetail(1L, 1L, 1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getExpenseId());
        assertEquals("Test Expense", result.getExpenseName());
        assertEquals(1, result.getTotalParticipants());
        assertEquals(1, result.getParticipants().size());
    }

    @Test
    void updateExpenseByExpenseId_Success() {
        // Given
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(testExpense));
        when(userRepository.findById(2L)).thenReturn(Optional.of(payerUser));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(anyLong(), anyLong()))
                .thenReturn(true);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(testCategory));
        when(expenseRepository.save(any(ExpenseEntity.class))).thenReturn(testExpense);
        when(expenseParticipantRepository.findAllByExpenseExpenseIdAndExpenseDeletedAtIsNull(1L))
                .thenReturn(Collections.emptyList());

        ExpenseParticipantEntity participantEntity = ExpenseParticipantEntity.builder()
                .participantId(1L)
                .expense(testExpense)
                .user(testUser)
                .shareAmount(new BigDecimal("100000"))
                .build();

        when(expenseParticipantService.addParticipant(anyLong(), anyLong(), any(BigDecimal.class)))
                .thenReturn(participantEntity);

        // When
        ExpenseDetailResponse result = expenseService.updateExpenseByExpenseId(
                1L, 1L, 1L, updateRequest);

        // Then
        assertNotNull(result);
        verify(expenseParticipantRepository, times(1)).deleteAllByExpenseExpenseId(1L);
        verify(balanceService, times(1)).rollBackBalance(any(), anyLong(), anyList());
        verify(balanceService, times(1)).updateBalancesForExpense(any(), anyList());
        verify(transactionService, times(1)).createTransaction(
                anyLong(), eq(1L), eq(ActionType.update), eq(EntityType.expense), eq(1L)
        );
    }

    @Test
    void updateExpenseByExpenseId_NotCreator_ThrowsException() {
        // Given
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(testExpense));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.updateExpenseByExpenseId(1L, 999L, 1L, updateRequest));

        assertTrue(exception.getMessage().contains("Only the creator can update"));
    }

    @Test
    void updateExpenseByExpenseId_ShareAmountMismatch_ThrowsException() {
        // Given
        UpdateExpenseRequest.ParticipantShareRequest wrongParticipant =
                new UpdateExpenseRequest.ParticipantShareRequest(1L, new BigDecimal("50000"));
        updateRequest.setParticipants(Collections.singletonList(wrongParticipant));
        updateRequest.setTotalAmount(new BigDecimal("100000"));

        when(expenseRepository.findByExpenseIdAndDeletedAtIsNull(1L))
                .thenReturn(Optional.of(testExpense));
        when(userRepository.findById(2L)).thenReturn(Optional.of(payerUser));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(anyLong(), anyLong()))
                .thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.updateExpenseByExpenseId(1L, 1L, 1L, updateRequest));

        assertTrue(exception.getMessage().contains("does not equal"));
    }

    @Test
    void getExpensesByConditions_Success() {
        // Given
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(true);
        when(expenseRepository.searchExpenses(
                anyLong(), anyString(), any(), any(), anyLong(), anyLong()))
                .thenReturn(Collections.singletonList(testExpense));

        // When
        List<ExpenseSimpleResponse> result = expenseService.getExpensesByConditions(
                1L, "Test", new Date(), new Date(), 1L, 1L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Expense", result.get(0).getExpenseName());
    }

    @Test
    void getExpensesByConditions_UserNotInGroup_ThrowsException() {
        // Given
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(false);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.getExpensesByConditions(
                        1L, "Test", new Date(), new Date(), 1L, 1L));

        assertTrue(exception.getMessage().contains("not a member"));
    }

    @Test
    void restoreExpense_Success() {
        // Given
        testExpense.setDeletedAt(new Date());
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNotNull(1L))
                .thenReturn(Optional.of(testExpense));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(true);
        when(expenseParticipantRepository.findAllByExpenseExpenseIdAndExpenseDeletedAtIsNull(1L))
                .thenReturn(Collections.emptyList());

        // When
        expenseService.restoreExpense(1L, 1L, 1L);

        // Then
        assertNull(testExpense.getDeletedAt());
        verify(expenseRepository, times(1)).save(testExpense);
        verify(balanceService, times(1)).updateBalancesForExpense(any(), anyList());
        verify(transactionService, times(1)).createTransaction(
                eq(1L), eq(1L), eq(ActionType.restore), eq(EntityType.expense), eq(1L)
        );
    }

    @Test
    void restoreExpense_NotCreator_ThrowsException() {
        // Given
        testExpense.setDeletedAt(new Date());
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNotNull(1L))
                .thenReturn(Optional.of(testExpense));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 999L))
                .thenReturn(true);

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.restoreExpense(1L, 999L, 1L));

        assertTrue(exception.getMessage().contains("Only the spend creator can restore"));
    }

    @Test
    void restoreExpense_ExpenseNotDeleted_ThrowsException() {
        // Given
        when(expenseRepository.findByExpenseIdAndDeletedAtIsNotNull(1L))
                .thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                expenseService.restoreExpense(1L, 1L, 1L));

        assertTrue(exception.getMessage().contains("Cannot find deleted"));
    }

    @Test
    void getExpensesByPayerId_Success() {
        // Given
        when(expenseRepository.findAllByPayerUserIdAndDeletedAtIsNull(2L))
                .thenReturn(Collections.singletonList(testExpense));

        // When
        List<ExpenseEntity> result = expenseService.getExpensesByPayerId(2L);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(2L, result.get(0).getPayer().getUserId());
    }
}