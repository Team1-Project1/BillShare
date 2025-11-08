package vn.backend.backend.service.Impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import vn.backend.backend.controller.request.PaymentRequest;
import vn.backend.backend.controller.response.PaymentResponse;
import vn.backend.backend.model.GroupEntity;
import vn.backend.backend.model.PaymentEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.PaymentRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.BalanceService;
import vn.backend.backend.service.TransactionService;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService Unit Tests")
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GroupMembersRepository groupMembersRepository;

    @Mock
    private BalanceService balanceService;

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private GroupEntity group;
    private UserEntity payer;
    private UserEntity payee;
    private UserEntity creator;
    private PaymentRequest paymentRequest;
    private PaymentEntity paymentEntity;

    @BeforeEach
    void setUp() {
        // Setup test data
        group = GroupEntity.builder()
                .groupId(1L)
                .groupName("Test Group")
                .build();

        payer = UserEntity.builder()
                .userId(1L)
                .fullName("Payer User")
                .build();

        payee = UserEntity.builder()
                .userId(2L)
                .fullName("Payee User")
                .build();

        creator = UserEntity.builder()
                .userId(3L)
                .fullName("Creator User")
                .build();

        paymentRequest = PaymentRequest.builder()
                .groupId(1L)
                .payerId(1L)
                .payeeId(2L)
                .amount(BigDecimal.valueOf(100.0))
                .currency("VND")
                .build();

        paymentEntity = PaymentEntity.builder()
                .paymentId(1L)
                .group(group)
                .payer(payer)
                .payee(payee)
                .amount(BigDecimal.valueOf(100.0))
                .currency("VND")
                .paymentDate(new Date())
                .build();
    }

    @Nested
    @DisplayName("Create Payment Tests")
    class CreatePaymentTests {

        @Test
        @DisplayName("Should create payment successfully")
        void shouldCreatePaymentSuccessfully() {
            // Given
            when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(group));
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 3L)).thenReturn(true);
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L)).thenReturn(true);
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 2L)).thenReturn(true);
            when(userRepository.findById(1L)).thenReturn(Optional.of(payer));
            when(userRepository.findById(2L)).thenReturn(Optional.of(payee));
            when(paymentRepository.save(any(PaymentEntity.class))).thenReturn(paymentEntity);

            // When
            PaymentResponse response = paymentService.createPayment(1L, paymentRequest, 3L);

            // Then
            assertNotNull(response);
            assertEquals(1L, response.getPaymentId());
            assertEquals(1L, response.getGroupId());
            assertEquals("Test Group", response.getGroupName());
            assertEquals(1L, response.getPayerId());
            assertEquals("Payer User", response.getPayerName());
            assertEquals(2L, response.getPayeeId());
            assertEquals("Payee User", response.getPayeeName());
            assertEquals(new BigDecimal("100.0"), response.getAmount());
            assertEquals("VND", response.getCurrency());

            verify(balanceService).updateBalancesForPayment(any(PaymentEntity.class));
            verify(transactionService).createTransaction(1L, 3L, ActionType.create, EntityType.payment, 1L);
        }

        @Test
        @DisplayName("Should throw exception when group not found")
        void shouldThrowExceptionWhenGroupNotFound() {
            // Given
            when(groupRepository.findByGroupId(1L)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.createPayment(1L, paymentRequest, 3L));

            assertEquals("Không tìm thấy nhóm với ID: 1", exception.getMessage());
            verify(paymentRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when groupId mismatch")
        void shouldThrowExceptionWhenGroupIdMismatch() {
            // Given
            paymentRequest.setGroupId(2L);
            when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(group));

            // When & Then
            IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                    () -> paymentService.createPayment(1L, paymentRequest, 3L));

            assertEquals("Group ID trong đường dẫn không khớp với Group ID trong request", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when creator not in group")
        void shouldThrowExceptionWhenCreatorNotInGroup() {
            // Given
            when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(group));
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 3L)).thenReturn(false);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.createPayment(1L, paymentRequest, 3L));

            assertEquals("Người tạo payment không phải là thành viên của nhóm", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when payer not in group")
        void shouldThrowExceptionWhenPayerNotInGroup() {
            // Given
            when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(group));
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 3L)).thenReturn(true);
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L)).thenReturn(false);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.createPayment(1L, paymentRequest, 3L));

            assertEquals("Người trả tiền không phải là thành viên của nhóm", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when payee not in group")
        void shouldThrowExceptionWhenPayeeNotInGroup() {
            // Given
            when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(group));
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 3L)).thenReturn(true);
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L)).thenReturn(true);
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 2L)).thenReturn(false);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.createPayment(1L, paymentRequest, 3L));

            assertEquals("Người nhận tiền không phải là thành viên của nhóm", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when payer and payee are same")
        void shouldThrowExceptionWhenPayerAndPayeeSame() {
            // Given
            paymentRequest.setPayeeId(1L); // Same as payerId
            when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(group));
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(anyLong(), anyLong())).thenReturn(true);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.createPayment(1L, paymentRequest, 3L));

            assertEquals("Người trả và người nhận không thể là cùng một người", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Update Payment Tests")
    class UpdatePaymentTests {

        @Test
        @DisplayName("Should update payment successfully")
        void shouldUpdatePaymentSuccessfully() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(paymentEntity));
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L)).thenReturn(true);
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 2L)).thenReturn(true);
            when(userRepository.findById(1L)).thenReturn(Optional.of(payer));
            when(userRepository.findById(2L)).thenReturn(Optional.of(payee));
            when(paymentRepository.save(any(PaymentEntity.class))).thenReturn(paymentEntity);

            // When
            PaymentResponse response = paymentService.updatePayment(1L, paymentRequest, 1L, 1L);

            // Then
            assertNotNull(response);
            verify(balanceService).updateBalancesAfterPaymentDeletion(any(PaymentEntity.class));
            verify(balanceService).updateBalancesForPayment(any(PaymentEntity.class));
            verify(transactionService).createTransaction(1L, 1L, ActionType.update, EntityType.payment, 1L);
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        void shouldThrowExceptionWhenPaymentNotFound() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.updatePayment(1L, paymentRequest, 1L, 1L));

            assertEquals("Không tìm thấy payment với ID: 1", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when payment not belong to group")
        void shouldThrowExceptionWhenPaymentNotBelongToGroup() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(paymentEntity));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.updatePayment(1L, paymentRequest, 1L, 2L));

            assertEquals("Payment không thuộc nhóm này", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when user not authorized")
        void shouldThrowExceptionWhenUserNotAuthorized() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(paymentEntity));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.updatePayment(1L, paymentRequest, 3L, 1L));

            assertEquals("Chỉ người trả hoặc người nhận mới có thể cập nhật payment này", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Delete Payment Tests")
    class DeletePaymentTests {

        @Test
        @DisplayName("Should delete payment successfully by payer")
        void shouldDeletePaymentSuccessfullyByPayer() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(paymentEntity));
            when(paymentRepository.save(any(PaymentEntity.class))).thenReturn(paymentEntity);

            // When
            paymentService.deletePayment(1L, 1L, 1L);

            // Then
            verify(balanceService).updateBalancesAfterPaymentDeletion(paymentEntity);
            verify(paymentRepository).save(any(PaymentEntity.class));
            verify(transactionService).createTransaction(1L, 1L, ActionType.delete, EntityType.payment, 1L);
        }

        @Test
        @DisplayName("Should delete payment successfully by payee")
        void shouldDeletePaymentSuccessfullyByPayee() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(paymentEntity));
            when(paymentRepository.save(any(PaymentEntity.class))).thenReturn(paymentEntity);

            // When
            paymentService.deletePayment(1L, 2L, 1L);

            // Then
            verify(balanceService).updateBalancesAfterPaymentDeletion(paymentEntity);
            verify(transactionService).createTransaction(1L, 2L, ActionType.delete, EntityType.payment, 1L);
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        void shouldThrowExceptionWhenPaymentNotFound() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.deletePayment(1L, 1L, 1L));

            assertEquals("Payment not found", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when user not authorized")
        void shouldThrowExceptionWhenUserNotAuthorized() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(paymentEntity));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.deletePayment(1L, 3L, 1L));

            assertEquals("Chỉ người trả hoặc người nhận mới có thể xóa payment này", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("Get Payments Tests")
    class GetPaymentsTests {

        @Test
        @DisplayName("Should get payments by group id successfully")
        void shouldGetPaymentsByGroupIdSuccessfully() {
            // Given
            List<PaymentEntity> payments = Arrays.asList(paymentEntity);
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L)).thenReturn(true);
            when(groupRepository.findByGroupId(1L)).thenReturn(Optional.of(group));
            when(paymentRepository.findAllByGroupGroupIdAndDeletedAtIsNull(1L)).thenReturn(payments);

            // When
            List<PaymentResponse> responses = paymentService.getPaymentsByGroupId(1L, 1L);

            // Then
            assertNotNull(responses);
            assertEquals(1, responses.size());
            assertEquals(1L, responses.get(0).getPaymentId());
        }

        @Test
        @DisplayName("Should throw exception when user not in group")
        void shouldThrowExceptionWhenUserNotInGroup() {
            // Given
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L)).thenReturn(false);

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.getPaymentsByGroupId(1L, 1L));

            assertEquals("Không phải là thành viên của nhóm", exception.getMessage());
        }

        @Test
        @DisplayName("Should get payment detail successfully")
        void shouldGetPaymentDetailSuccessfully() {
            // Given
            when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(1L, 1L)).thenReturn(true);
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(paymentEntity));

            // When
            PaymentResponse response = paymentService.getPaymentDetail(1L, 1L, 1L);

            // Then
            assertNotNull(response);
            assertEquals(1L, response.getPaymentId());
            assertEquals("Payer User", response.getPayerName());
        }

        @Test
        @DisplayName("Should get payments by payer id")
        void shouldGetPaymentsByPayerId() {
            // Given
            List<PaymentEntity> payments = Arrays.asList(paymentEntity);
            when(paymentRepository.findAllByPayerUserIdAndDeletedAtIsNull(1L)).thenReturn(payments);

            // When
            List<PaymentEntity> result = paymentService.getPaymentsByPayerId(1L);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
        }

        @Test
        @DisplayName("Should get payments by payee id")
        void shouldGetPaymentsByPayeeId() {
            // Given
            List<PaymentEntity> payments = Arrays.asList(paymentEntity);
            when(paymentRepository.findAllByPayeeUserIdAndDeletedAtIsNull(2L)).thenReturn(payments);

            // When
            List<PaymentEntity> result = paymentService.getPaymentsByPayeeId(2L);

            // Then
            assertNotNull(result);
            assertEquals(1, result.size());
        }
    }

    @Nested
    @DisplayName("Restore Payment Tests")
    class RestorePaymentTests {

        @Test
        @DisplayName("Should restore payment successfully")
        void shouldRestorePaymentSuccessfully() {
            // Given
            paymentEntity.setDeletedAt(new Date());
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNotNull(1L)).thenReturn(Optional.of(paymentEntity));
            when(paymentRepository.save(any(PaymentEntity.class))).thenReturn(paymentEntity);

            // When
            paymentService.restorePayment(1L, 1L, 1L);

            // Then
            ArgumentCaptor<PaymentEntity> captor = ArgumentCaptor.forClass(PaymentEntity.class);
            verify(paymentRepository).save(captor.capture());
            assertNull(captor.getValue().getDeletedAt());
            verify(balanceService).updateBalancesForPayment(any(PaymentEntity.class));
            verify(transactionService).createTransaction(1L, 1L, ActionType.restore, EntityType.payment, 1L);
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        void shouldThrowExceptionWhenPaymentNotFound() {
            // Given
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNotNull(1L)).thenReturn(Optional.empty());

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.restorePayment(1L, 1L, 1L));

            assertEquals("Payment with ID not found: 1", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when payment not belong to group")
        void shouldThrowExceptionWhenPaymentNotBelongToGroup() {
            // Given
            paymentEntity.setDeletedAt(new Date());
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNotNull(1L)).thenReturn(Optional.of(paymentEntity));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.restorePayment(1L, 1L, 2L));

            assertEquals("Payment does not belong to this group", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when user not authorized")
        void shouldThrowExceptionWhenUserNotAuthorized() {
            // Given
            paymentEntity.setDeletedAt(new Date());
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNotNull(1L)).thenReturn(Optional.of(paymentEntity));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.restorePayment(1L, 3L, 1L));

            assertEquals("Only the payer or payee of the payment can restore this payment.", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when payment not deleted")
        void shouldThrowExceptionWhenPaymentNotDeleted() {
            // Given
            paymentEntity.setDeletedAt(null);
            when(paymentRepository.findByPaymentIdAndDeletedAtIsNotNull(1L)).thenReturn(Optional.of(paymentEntity));

            // When & Then
            RuntimeException exception = assertThrows(RuntimeException.class,
                    () -> paymentService.restorePayment(1L, 1L, 1L));

            assertEquals("This payment has not been deleted, no need to restore", exception.getMessage());
        }
    }
}