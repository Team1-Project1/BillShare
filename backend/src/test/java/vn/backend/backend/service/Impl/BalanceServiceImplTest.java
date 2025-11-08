package vn.backend.backend.service.Impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.backend.backend.controller.response.BalanceResponse;
import vn.backend.backend.model.*;
import vn.backend.backend.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BalanceServiceImpl Unit Tests")
class BalanceServiceImplTest {

    @Mock
    private BalanceRepository balanceRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GroupMembersRepository groupMembersRepository;

    @Mock
    private ExpenseParticipantRepository expenseParticipantRepository;

    @InjectMocks
    private BalanceServiceImpl balanceService;

    private GroupEntity testGroup;
    private UserEntity user1;
    private UserEntity user2;
    private UserEntity user3;
    private UserEntity user4;
    private BalanceEntity balance;

    private BalanceEntity balance1_2, balance2_3, balance1_3_zero, balance2_1_net, balance2_4, balance1_4_zero;

    // === THAY ĐỔI 1: Thêm biến cho GroupMembers ===
    private GroupMembersEntity gm1;
    private GroupMembersEntity gm2;

    @BeforeEach
    void setUp() {
        // Setup test data
        testGroup = new GroupEntity();
        testGroup.setGroupId(1L);
        testGroup.setGroupName("Test Group");
        testGroup.setSimplifyDebtOn(false);

        user1 = new UserEntity();
        user1.setUserId(1L);
        user1.setFullName("User One");

        user2 = new UserEntity();
        user2.setUserId(2L);
        user2.setFullName("User Two");

        user3 = new UserEntity();
        user3.setUserId(3L);
        user3.setFullName("User Three");

        user4 = new UserEntity();
        user4.setUserId(4L);
        user4.setFullName("User Four");

        // Kịch bản A -> B (User 1 nợ User 2 100)
        balance1_2 = BalanceEntity.builder()
                .balanceId(1L)
                .group(testGroup)
                .user1(user1)
                .user2(user2)
                .balance(new BigDecimal("100.00"))
                .build();

        // Kịch bản B -> A (User 2 nợ User 1 50) - Dùng để test bù trừ
        balance2_1_net = BalanceEntity.builder()
                .balanceId(2L)
                .group(testGroup)
                .user1(user2)
                .user2(user1)
                .balance(new BigDecimal("50.00"))
                .build();

        // Kịch bản B -> C (User 2 nợ User 3 100) - Dùng để test chuỗi
        balance2_3 = BalanceEntity.builder()
                .balanceId(3L)
                .group(testGroup)
                .user1(user2)
                .user2(user3)
                .balance(new BigDecimal("100.00"))
                .build();

        // Kịch bản A -> C (Balance = 0) - Cạnh "cầu nối"
        balance1_3_zero = BalanceEntity.builder()
                .balanceId(4L)
                .group(testGroup)
                .user1(user1)
                .user2(user3)
                .balance(BigDecimal.ZERO)
                .build();

        // Kịch bản B -> D (User 2 nợ User 4 50)
        balance2_4 = BalanceEntity.builder()
                .balanceId(5L)
                .group(testGroup)
                .user1(user2)
                .user2(user4)
                .balance(new BigDecimal("50.00"))
                .build();

        // Kịch bản A -> D (Balance = 0) - Cạnh "cầu nối"
        balance1_4_zero = BalanceEntity.builder()
                .balanceId(6L)
                .group(testGroup)
                .user1(user1)
                .user2(user4)
                .balance(BigDecimal.ZERO)
                .build();

        // === THAY ĐỔI 2: Khởi tạo GroupMembers bằng builder và thực thể cha ===
        // Cách làm này tận dụng @MapsId, JPA sẽ tự động
        // tạo EmbeddedId (GroupMembersId) từ group và member.
        gm1 = GroupMembersEntity.builder()
                .group(testGroup)
                .member(user1)
                .build();

        gm2 = GroupMembersEntity.builder()
                .group(testGroup)
                .member(user2)
                .build();
        // === HẾT THAY ĐỔI 2 ===


        balance = new BalanceEntity();
        balance.setBalanceId(1L);
        balance.setGroup(testGroup);
        balance.setUser1(user1);
        balance.setUser2(user2);
        balance.setBalance(new BigDecimal("100.00"));
    }

    @Test
    @DisplayName("Create balance - Success")
    void testCreateBalance_Success() {
        // Arrange
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(balanceRepository.save(any(BalanceEntity.class))).thenReturn(balance);

        // Act
        BalanceEntity result = balanceService.createBalance(1L, 1L, 2L, new BigDecimal("100.00"));

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("100.00"), result.getBalance());
        verify(balanceRepository, times(1)).save(any(BalanceEntity.class));
    }

    @Test
    @DisplayName("Create balance - Group not found")
    void testCreateBalance_GroupNotFound() {
        // Arrange
        when(groupRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> balanceService.createBalance(1L, 1L, 2L, new BigDecimal("100.00")));
    }

    @Test
    @DisplayName("Update balance - Success")
    void testUpdateBalance_Success() {
        // Arrange
        when(balanceRepository.findById(1L)).thenReturn(Optional.of(balance));
        when(balanceRepository.save(any(BalanceEntity.class))).thenReturn(balance);

        // Act
        BalanceEntity result = balanceService.updateBalance(1L, new BigDecimal("200.00"));

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("200.00"), result.getBalance());
        verify(balanceRepository, times(1)).save(balance);
    }

    @Test
    @DisplayName("Get balances by group ID")
    void testGetBalancesByGroupId() {
        // Arrange
        List<BalanceEntity> balances = Arrays.asList(balance);
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(balances);

        // Act
        List<BalanceEntity> result = balanceService.getBalancesByGroupId(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(balance, result.get(0));
    }

    @Test
    @DisplayName("Get balance between users - Success")
    void testGetBalanceBetweenUsers_Success() {
        // Arrange
        when(balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(1L, 1L, 2L))
                .thenReturn(Optional.of(balance));

        // Act
        BalanceEntity result = balanceService.getBalanceBetweenUsers(1L, 1L, 2L);

        // Assert
        assertNotNull(result);
        assertEquals(balance, result);
    }

    @Test
    @DisplayName("Get balance between users - Not found")
    void testGetBalanceBetweenUsers_NotFound() {
        // Arrange
        when(balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(1L, 1L, 2L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> balanceService.getBalanceBetweenUsers(1L, 1L, 2L));
    }

    @Test
    @DisplayName("Update balances for expense - Multiple participants")
    void testUpdateBalancesForExpense() {
        // Arrange
        ExpenseEntity expense = new ExpenseEntity();
        expense.setGroup(testGroup);
        expense.setPayer(user1);

        ExpenseParticipantEntity participant1 = new ExpenseParticipantEntity();
        participant1.setUser(user1);
        participant1.setShareAmount(new BigDecimal("50.00"));

        ExpenseParticipantEntity participant2 = new ExpenseParticipantEntity();
        participant2.setUser(user2);
        participant2.setShareAmount(new BigDecimal("50.00"));

        List<ExpenseParticipantEntity> participants = Arrays.asList(participant1, participant2);

        when(balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());
        when(groupRepository.getReferenceById(anyLong())).thenReturn(testGroup);
        when(userRepository.getReferenceById(1L)).thenReturn(user1);
        when(userRepository.getReferenceById(2L)).thenReturn(user2);
        when(balanceRepository.save(any(BalanceEntity.class))).thenReturn(balance);

        // Act
        balanceService.updateBalancesForExpense(expense, participants);

        // Assert
        verify(balanceRepository, atLeastOnce()).save(any(BalanceEntity.class));
    }

    @Test
    @DisplayName("Rollback balance - Success")
    void testRollBackBalance() {
        // Arrange
        ExpenseEntity expense = new ExpenseEntity();
        expense.setGroup(testGroup);

        ExpenseParticipantEntity participant = new ExpenseParticipantEntity();
        participant.setUser(user2);
        participant.setShareAmount(new BigDecimal("50.00"));

        List<ExpenseParticipantEntity> participants = Arrays.asList(participant);

        when(balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(1L, 1L, 2L))
                .thenReturn(Optional.of(balance));
        when(balanceRepository.save(any(BalanceEntity.class))).thenReturn(balance);

        // Act
        balanceService.rollBackBalance(expense, 1L, participants);

        // Assert
        verify(balanceRepository, times(1)).save(balance);
    }

    @Test
    @DisplayName("Check group net debt - Has debt")
    void testCheckGroupNetDebt_HasDebt() {
        // Arrange
        balance.setBalance(new BigDecimal("100.00"));
        List<BalanceEntity> balances = Arrays.asList(balance);

        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(balances);
        when(groupMembersRepository.findAllById_GroupId(1L))
                .thenReturn(Arrays.asList(gm1, gm2));

        // Act
        boolean result = balanceService.checkGroupNetDebt(1L);

        // Assert
        assertTrue(result);
    }

    @Test
    @DisplayName("Check group net debt - No debt")
    void testCheckGroupNetDebt_NoDebt() {
        // Arrange
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(Collections.emptyList());

        // Act
        boolean result = balanceService.checkGroupNetDebt(1L);

        // Assert
        assertFalse(result);
    }

    @Test
    @DisplayName("Settle group debts - Success when no net debt")
    void testSettleGroupDebts_Success() {
        // Arrange
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(Collections.emptyList());
        doNothing().when(balanceRepository).setAllBalancesToZeroByGroupId(1L);

        // Act & Assert
        assertDoesNotThrow(() -> balanceService.settleGroupDebts(1L));
        verify(balanceRepository, times(1)).setAllBalancesToZeroByGroupId(1L);
    }

    @Test
    @DisplayName("Settle group debts - Fail when has net debt")
    void testSettleGroupDebts_FailWhenHasDebt() {
        // Arrange
        balance.setBalance(new BigDecimal("100.00"));
        List<BalanceEntity> balances = Arrays.asList(balance);

        // === THAY ĐỔI 4: Xóa bỏ khối code tạo gm1, gm2 thủ công ===
        // (Chúng đã được tạo trong setUp())

        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(balances);
        when(groupMembersRepository.findAllById_GroupId(1L))
                .thenReturn(Arrays.asList(gm1, gm2)); // Sử dụng biến đã khởi tạo

        // Act & Assert
        assertThrows(IllegalStateException.class,
                () -> balanceService.settleGroupDebts(1L));
    }

    @Test
    @DisplayName("Check user net debt in group - Has debt")
    void testCheckUserNetDebtInGroup_HasDebt() {
        // Arrange
        balance.setBalance(new BigDecimal("100.00"));
        List<BalanceEntity> balances = Arrays.asList(balance);
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(balances);

        // Act
        boolean result = balanceService.checkUserNetDebtInGroup(1L, 1L);

        // Assert
        assertTrue(result);
    }

    @Test
    @DisplayName("Check user net debt in group - No debt")
    void testCheckUserNetDebtInGroup_NoDebt() {
        // Arrange
        balance.setBalance(new BigDecimal("0.00"));
        List<BalanceEntity> balances = Arrays.asList(balance);
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(balances);

        // Act
        boolean result = balanceService.checkUserNetDebtInGroup(1L, 1L);

        // Assert
        assertFalse(result);
    }

    @Test
    @DisplayName("Get user balance response - Without simplification")
    void testGetUserBalanceResponse_WithoutSimplification() {
        // Arrange
        testGroup.setSimplifyDebtOn(false);
        balance.setBalance(new BigDecimal("100.00"));
        List<BalanceEntity> balances = Arrays.asList(balance);

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(true);
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(balances);

        // Act
        BalanceResponse result = balanceService.getUserBalanceResponse(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals("User One", result.getUserName());
        assertEquals(1, result.getBalances().size());
    }

    @Test
    @DisplayName("Get user balance response - User not in group")
    void testGetUserBalanceResponse_UserNotInGroup() {
        // Arrange
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L))
                .thenReturn(false);

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> balanceService.getUserBalanceResponse(1L, 1L));
    }

    @Test
    @DisplayName("Update balances for payment - Success")
    void testUpdateBalancesForPayment() {
        // Arrange
        PaymentEntity payment = new PaymentEntity();
        payment.setPayer(user1);
        payment.setPayee(user2);
        payment.setGroup(testGroup);
        payment.setAmount(new BigDecimal("50.00"));

        when(balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.of(balance));
        when(balanceRepository.save(any(BalanceEntity.class))).thenReturn(balance);

        // Act
        balanceService.updateBalancesForPayment(payment);

        // Assert
        verify(balanceRepository, times(1)).save(any(BalanceEntity.class));
    }

    @Test
    @DisplayName("Update balances after payment deletion - Success")
    void testUpdateBalancesAfterPaymentDeletion() {
        // Arrange
        PaymentEntity payment = new PaymentEntity();
        payment.setPayer(user1);
        payment.setPayee(user2);
        payment.setGroup(testGroup);
        payment.setAmount(new BigDecimal("50.00"));

        when(balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.of(balance));
        when(balanceRepository.save(any(BalanceEntity.class))).thenReturn(balance);

        // Act
        balanceService.updateBalancesAfterPaymentDeletion(payment);

        // Assert
        verify(balanceRepository, times(1)).save(any(BalanceEntity.class));
    }

    @Test
    @DisplayName("Update balances after expense deletion - Success")
    void testUpdateBalancesAfterExpenseDeletion() {
        // Arrange
        ExpenseParticipantEntity participant = new ExpenseParticipantEntity();
        participant.setUser(user2);
        participant.setShareAmount(new BigDecimal("50.00"));

        List<ExpenseParticipantEntity> participants = Arrays.asList(participant);

        when(balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.of(balance));
        when(balanceRepository.save(any(BalanceEntity.class))).thenReturn(balance);

        // Act
        balanceService.updateBalancesAfterExpenseDeletion(1L, 1L, participants);

        // Assert
        verify(balanceRepository, atLeastOnce()).save(any(BalanceEntity.class));
    }

    @Test
    @DisplayName("Get simplified user balance response - Empty balances")
    void testGetSimplifiedUserBalanceResponse_EmptyBalances() {
        // Arrange
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(Collections.emptyList());

        // Act
        BalanceResponse result = balanceService.getSimplifiedUserBalanceResponse(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertTrue(result.getBalances().isEmpty());
    }

    @Test
    @DisplayName("Get simplified user balance response - Group not found")
    void testGetSimplifiedUserBalanceResponse_GroupNotFound() {
        // Arrange
        when(groupRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NoSuchElementException.class,
                () -> balanceService.getSimplifiedUserBalanceResponse(1L, 1L));
    }

    @Test
    @DisplayName("Simplified Balance - Group Not Found Throws Exception")
    void testGetSimplifiedBalance_GroupNotFound() {
        // Arrange
        when(groupRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NoSuchElementException.class,
                () -> balanceService.getSimplifiedUserBalanceResponse(1L, 1L));
    }

    @Test
    @DisplayName("Simplified Balance - User Not Found Throws Exception")
    void testGetSimplifiedBalance_UserNotFound() {
        // Arrange
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.empty()); // User không tìm thấy

        // Act & Assert
        assertThrows(NoSuchElementException.class,
                () -> balanceService.getSimplifiedUserBalanceResponse(1L, 1L));
    }

    @Test
    @DisplayName("Simplified Balance - No Balances Returns Empty List")
    void testGetSimplifiedBalance_NoBalances_ReturnsEmptyList() {
        // Arrange
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        // Trả về list rỗng
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(Collections.emptyList());

        // Act
        BalanceResponse result = balanceService.getSimplifiedUserBalanceResponse(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertTrue(result.getBalances().isEmpty()); // Quan trọng: Phải trả về list rỗng
    }

    @Test
    @DisplayName("Simplified Balance - A nợ B, B nợ A (Bù trừ)")
    void testGetSimplifiedBalance_NetOutDebt_ABA() {
        // Kịch bản: A nợ B 100. B nợ A 50.
        // Kết quả: A nợ B 50.

        // Arrange
        List<BalanceEntity> allBalances = Arrays.asList(balance1_2, balance2_1_net);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(allBalances);

        // Act
        BalanceResponse result = balanceService.getSimplifiedUserBalanceResponse(1L, 1L); // Xem từ góc nhìn User 1 (A)

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getBalances().size());

        BalanceResponse.UserBalanceDetail detail = result.getBalances().get(0);
        assertEquals(2L, detail.getUserId()); // Nợ User 2 (B)
        assertEquals(new BigDecimal("50.00").setScale(2, RoundingMode.HALF_UP), detail.getAmount());
        assertFalse(detail.isOwed()); // isOwed = false (Tôi nợ người ta)
    }

    @Test
    @DisplayName("Simplified Balance - Tối ưu chuỗi A -> B -> C")
    void testGetSimplifiedBalance_ChainSimplification_ABC() {
        // Kịch bản: A nợ B 100. B nợ C 100.
        //           (Và có 1 cạnh A-C với balance = 0 để làm cầu nối)
        // Kết quả: A nợ C 100. (B được loại bỏ)

        // Arrange
        List<BalanceEntity> allBalances = Arrays.asList(balance1_2, balance2_3, balance1_3_zero);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(allBalances);

        // Act
        // 1. Xem từ góc nhìn User 1 (A)
        BalanceResponse resultA = balanceService.getSimplifiedUserBalanceResponse(1L, 1L);

        // 2. Xem từ góc nhìn User 2 (B) - Người trung gian
        BalanceResponse resultB = balanceService.getSimplifiedUserBalanceResponse(1L, 2L);

        // Assert A (User 1)
        assertNotNull(resultA);
        assertEquals(1, resultA.getBalances().size());
        BalanceResponse.UserBalanceDetail detailA = resultA.getBalances().get(0);
        assertEquals(3L, detailA.getUserId()); // Nợ trực tiếp User 3 (C)
        assertEquals(new BigDecimal("100.00").setScale(2, RoundingMode.HALF_UP), detailA.getAmount());
        assertFalse(detailA.isOwed()); // Tôi nợ C

        // Assert B (User 2) - Quan trọng!
        assertNotNull(resultB);
        assertTrue(resultB.getBalances().isEmpty()); // User 2 không còn nợ nần gì cả
    }

    @Test
    @DisplayName("Simplified Balance - Kịch bản phức tạp (A,B nợ C,D)")
    void testGetSimplifiedBalance_ComplexScenario_MultipleDebtors() {
        // Kịch bản:
        // A nợ B 100 (net A: +100, B: -100)
        // B nợ C 100 (net B: 0, C: -100)
        // B nợ D 50  (net B: +50, D: -50)
        // (Cầu nối A-C = 0, A-D = 0)
        // TỔNG NET: A: +100, B: +50, C: -100, D: -50

        // Kết quả mong đợi (từ Max-Flow):
        // A -> C: 100
        // B -> D: 50

        // Arrange
        // (Dùng lại balance1_2, balance2_3, balance1_3_zero)
        // Thêm B nợ D 50 và cầu A-D
        List<BalanceEntity> allBalances = Arrays.asList(
                balance1_2,     // A nợ B 100
                balance2_3,     // B nợ C 100
                balance2_4,     // B nợ D 50
                balance1_3_zero, // Cầu A-C
                balance1_4_zero  // Cầu A-D
        );

        when(groupRepository.findById(1L)).thenReturn(Optional.of(testGroup));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(balanceRepository.findAllByGroupGroupId(1L)).thenReturn(allBalances);

        // Act
        // 1. Xem từ góc nhìn User 1 (A)
        BalanceResponse resultA = balanceService.getSimplifiedUserBalanceResponse(1L, 1L);

        // 2. Xem từ góc nhìn User 2 (B)
        BalanceResponse resultB = balanceService.getSimplifiedUserBalanceResponse(1L, 2L);

        // Assert A (User 1)
        assertNotNull(resultA);
        // Tùy thuộc vào đường BFS tìm được, A có thể nợ C, hoặc nợ D, hoặc cả 2
        // Miễn là tổng nợ của A là 100
        BigDecimal totalDebtA = resultA.getBalances().stream()
                .filter(d -> !d.isOwed())
                .map(BalanceResponse.UserBalanceDetail::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(new BigDecimal("100.00").setScale(2, RoundingMode.HALF_UP), totalDebtA.setScale(2, RoundingMode.HALF_UP));

        // Assert B (User 2)
        assertNotNull(resultB);
        // Tổng nợ của B là 50
        BigDecimal totalDebtB = resultB.getBalances().stream()
                .filter(d -> !d.isOwed())
                .map(BalanceResponse.UserBalanceDetail::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(new BigDecimal("50.00").setScale(2, RoundingMode.HALF_UP), totalDebtB.setScale(2, RoundingMode.HALF_UP));
    }
}