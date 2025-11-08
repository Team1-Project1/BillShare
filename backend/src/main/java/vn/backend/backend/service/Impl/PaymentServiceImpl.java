package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import vn.backend.backend.controller.request.PaymentRequest;
import vn.backend.backend.controller.response.PaymentResponse;
import vn.backend.backend.model.GroupEntity;
import vn.backend.backend.model.GroupMembersEntity;
import vn.backend.backend.model.PaymentEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.PaymentRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.BalanceService;
import vn.backend.backend.service.PaymentService;
import vn.backend.backend.service.TransactionService;

import java.util.Date;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMembersRepository groupMembersRepository;
    private final BalanceService balanceService;
    private final TransactionService transactionService;

    @Override
    @Transactional
    public PaymentResponse createPayment(Long groupId, PaymentRequest request, Long createdByUserId) {
        // Kiểm tra nhóm tồn tại
        GroupEntity group = groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm với ID: " + groupId));

        // Kiểm tra tính nhất quán giữa groupId trong path và trong request
        if (request.getGroupId() != null && !groupId.equals(request.getGroupId())) {
            throw new IllegalArgumentException("Group ID trong đường dẫn không khớp với Group ID trong request");
        }

        // Kiểm tra người tạo payment có trong nhóm không
        if (!isUserInGroup(createdByUserId, groupId)) {
            throw new RuntimeException("Người tạo payment không phải là thành viên của nhóm");
        }

        // Kiểm tra người trả tiền có trong nhóm không
        if (!isUserInGroup(request.getPayerId(), groupId)) {
            throw new RuntimeException("Người trả tiền không phải là thành viên của nhóm");
        }

        // Kiểm tra người nhận tiền có trong nhóm không
        if (!isUserInGroup(request.getPayeeId(), groupId)) {
            throw new RuntimeException("Người nhận tiền không phải là thành viên của nhóm");
        }

        // Kiểm tra payer và payee không trùng nhau
        if (request.getPayerId().equals(request.getPayeeId())) {
            throw new RuntimeException("Người trả và người nhận không thể là cùng một người");
        }

        UserEntity payer = userRepository.findById(request.getPayerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người trả với ID: " + request.getPayerId()));

        UserEntity payee = userRepository.findById(request.getPayeeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận với ID: " + request.getPayeeId()));

        // Tạo payment entity
        PaymentEntity payment = PaymentEntity.builder()
                .group(group)
                .payer(payer)
                .payee(payee)
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentDate(new Date())
                .build();

        PaymentEntity savedPayment = paymentRepository.save(payment);

        // Cập nhật balance sau khi payment
        balanceService.updateBalancesForPayment(savedPayment);

        // Tạo transaction
        transactionService.createTransaction(
                groupId,
                createdByUserId,
                ActionType.create,
                EntityType.payment,
                savedPayment.getPaymentId()
        );

        return PaymentResponse.builder()
                .paymentId(savedPayment.getPaymentId())
                .groupId(savedPayment.getGroup().getGroupId())
                .groupName(savedPayment.getGroup().getGroupName())
                .payerId(savedPayment.getPayer().getUserId())
                .payerName(savedPayment.getPayer().getFullName())
                .payeeId(savedPayment.getPayee().getUserId())
                .payeeName(savedPayment.getPayee().getFullName())
                .amount(savedPayment.getAmount())
                .currency(savedPayment.getCurrency())
                .paymentDate(savedPayment.getPaymentDate())
                .build();
    }

    @Override
    @Transactional
    public PaymentResponse updatePayment(Long paymentId, PaymentRequest request, Long requestingUserId, Long groupId) {
        // Tìm payment hiện tại
        PaymentEntity existingPayment = paymentRepository.findByPaymentIdAndDeletedAtIsNull(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy payment với ID: " + paymentId));

        // Kiểm tra payment thuộc đúng group
        if (!existingPayment.getGroup().getGroupId().equals(groupId)) {
            throw new RuntimeException("Payment không thuộc nhóm này");
        }

        // Kiểm tra người cập nhật có quyền không (phải là payer hoặc payee)
        if (!existingPayment.getPayer().getUserId().equals(requestingUserId)
                && !existingPayment.getPayee().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Chỉ người trả hoặc người nhận mới có thể cập nhật payment này");
        }

        // Kiểm tra người trả tiền có trong nhóm không
        if (!isUserInGroup(request.getPayerId(), groupId)) {
            throw new RuntimeException("Người trả tiền không phải là thành viên của nhóm");
        }

        // Kiểm tra người nhận tiền có trong nhóm không
        if (!isUserInGroup(request.getPayeeId(), groupId)) {
            throw new RuntimeException("Người nhận tiền không phải là thành viên của nhóm");
        }

        // Kiểm tra payer và payee không trùng nhau
        if (request.getPayerId().equals(request.getPayeeId())) {
            throw new RuntimeException("Người trả và người nhận không thể là cùng một người");
        }

        // Rollback balance của payment cũ
        balanceService.updateBalancesAfterPaymentDeletion(existingPayment);

        // Cập nhật thông tin payment
        UserEntity newPayer = userRepository.findById(request.getPayerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người trả với ID: " + request.getPayerId()));

        UserEntity newPayee = userRepository.findById(request.getPayeeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận với ID: " + request.getPayeeId()));

        existingPayment.setPayer(newPayer);
        existingPayment.setPayee(newPayee);
        existingPayment.setAmount(request.getAmount());
        existingPayment.setCurrency(request.getCurrency());

        PaymentEntity updatedPayment = paymentRepository.save(existingPayment);

        // Cập nhật balance mới
        balanceService.updateBalancesForPayment(updatedPayment);

        // Tạo transaction
        transactionService.createTransaction(
                groupId,
                requestingUserId,
                ActionType.update,
                EntityType.payment,
                updatedPayment.getPaymentId()
        );

        return PaymentResponse.builder()
                .paymentId(updatedPayment.getPaymentId())
                .groupId(updatedPayment.getGroup().getGroupId())
                .groupName(updatedPayment.getGroup().getGroupName())
                .payerId(updatedPayment.getPayer().getUserId())
                .payerName(updatedPayment.getPayer().getFullName())
                .payeeId(updatedPayment.getPayee().getUserId())
                .payeeName(updatedPayment.getPayee().getFullName())
                .amount(updatedPayment.getAmount())
                .currency(updatedPayment.getCurrency())
                .paymentDate(updatedPayment.getPaymentDate())
                .build();
    }


    @Override
    @Transactional
    public void deletePayment(Long paymentId, Long requestingUserId, Long groupId) {
        PaymentEntity payment = paymentRepository.findByPaymentIdAndDeletedAtIsNull(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        // Kiểm tra người xóa có quyền không (có thể là payer hoặc payee)
        if (!payment.getPayer().getUserId().equals(requestingUserId)
                && !payment.getPayee().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Chỉ người trả hoặc người nhận mới có thể xóa payment này");
        }

        // Rollback balance
        balanceService.updateBalancesAfterPaymentDeletion(payment);

        // Xóa payment
        payment.setDeletedAt(new Date());
        paymentRepository.save(payment);


        // Tạo transaction
        transactionService.createTransaction(
                groupId,
                requestingUserId,
                ActionType.delete,
                EntityType.payment,
                paymentId
        );
    }

    @Override
    public List<PaymentResponse> getPaymentsByGroupId(Long groupId, Long userId) {
        // Verify user is in group
        if (!isUserInGroup(userId, groupId)) {
            throw new RuntimeException("Không phải là thành viên của nhóm");
        }

        // Verify group exists
        groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        List<PaymentEntity> payments = paymentRepository.findAllByGroupGroupIdAndDeletedAtIsNull(groupId);

        return payments.stream()
                .map(payment -> PaymentResponse.builder()
                        .paymentId(payment.getPaymentId())
                        .groupId(payment.getGroup().getGroupId())
                        .groupName(payment.getGroup().getGroupName())
                        .payerId(payment.getPayer().getUserId())
                        .payerName(payment.getPayer().getFullName())
                        .payeeId(payment.getPayee().getUserId())
                        .payeeName(payment.getPayee().getFullName())
                        .amount(payment.getAmount())
                        .currency(payment.getCurrency())
                        .paymentDate(payment.getPaymentDate())
                        .build())
                .toList();
    }

    @Override
    public PaymentResponse getPaymentDetail(Long paymentId, Long userId, Long groupId) {
        // Verify user is in group
        if (!isUserInGroup(userId, groupId)) {
            throw new RuntimeException("Không phải là thành viên của nhóm");
        }

        PaymentEntity payment = paymentRepository.findByPaymentIdAndDeletedAtIsNull(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .groupId(payment.getGroup().getGroupId())
                .groupName(payment.getGroup().getGroupName())
                .payerId(payment.getPayer().getUserId())
                .payerName(payment.getPayer().getFullName())
                .payeeId(payment.getPayee().getUserId())
                .payeeName(payment.getPayee().getFullName())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentDate(payment.getPaymentDate())
                .build();
    }

    @Override
    public Page<PaymentResponse> getPaymentDeleted(Long groupId, Long userId, int page, int size) {
        GroupEntity group = groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));
        GroupMembersEntity member = groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId);
        if(member == null){
            throw new RuntimeException("User is not a member of the group with ID: " + groupId);
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("deletedAt").descending());
        Page<PaymentEntity> paymentPage = paymentRepository.findAllPaymentsByGroupAndPayerOrPayee(groupId, userId, pageable);
        return paymentPage.map(payment -> PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .groupId(payment.getGroup().getGroupId())
                .groupName(payment.getGroup().getGroupName())
                .payerId(payment.getPayer().getUserId())
                .payerName(payment.getPayer().getFullName())
                .payeeId(payment.getPayee().getUserId())
                .payeeName(payment.getPayee().getFullName())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentDate(payment.getPaymentDate())
                .deletedAt(payment.getDeletedAt())
                .build());
    }

    @Override
    public List<PaymentEntity> getPaymentsByPayerId(Long payerId) {
        return paymentRepository.findAllByPayerUserIdAndDeletedAtIsNull(payerId);
    }

    @Override
    public List<PaymentEntity> getPaymentsByPayeeId(Long payeeId) {
        return paymentRepository.findAllByPayeeUserIdAndDeletedAtIsNull(payeeId);
    }

    @Override
    @Transactional
    public void restorePayment(Long paymentId, Long requestingUserId, Long groupId) {
        // 1. Tìm payment kể cả đã bị xóa mềm
        PaymentEntity payment = paymentRepository.findByPaymentIdAndDeletedAtIsNotNull(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment with ID not found: " + paymentId));

        // 2. Kiểm tra payment thuộc group
        if (!payment.getGroup().getGroupId().equals(groupId)) {
            throw new RuntimeException("Payment does not belong to this group");
        }

        if (!payment.getPayer().getUserId().equals(requestingUserId) && !payment.getPayee().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Only the payer or payee of the payment can restore this payment.");
        }

        // 4. Kiểm tra xem payment đã xóa hay chưa
        if (payment.getDeletedAt() == null) {
            throw new RuntimeException("This payment has not been deleted, no need to restore");
        }

        // 5. Khôi phục payment
        payment.setDeletedAt(null);
        PaymentEntity restored = paymentRepository.save(payment);

        // 6. Cập nhật lại balance sau khi restore
        balanceService.updateBalancesForPayment(restored);

        // 7. Ghi transaction log
        log.info("Creating transaction log...");
        transactionService.createTransaction(
                groupId,
                requestingUserId,
                ActionType.restore,
                EntityType.payment,
                paymentId
        );
        log.info("Transaction log created.");

    }


    private boolean isUserInGroup(Long userId, Long groupId) {
        return groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId);
    }
}
