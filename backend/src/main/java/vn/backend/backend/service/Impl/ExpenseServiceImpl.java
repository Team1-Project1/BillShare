package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.model.ExpenseParticipantEntity;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.ExpenseService;
import vn.backend.backend.service.ExpenseParticipantService;
import vn.backend.backend.service.BalanceService;
import vn.backend.backend.service.TransactionService;
import vn.backend.backend.controller.request.CreateExpenseRequest;
import vn.backend.backend.controller.response.ExpenseDetailResponse;
import vn.backend.backend.controller.response.ExpenseParticipantResponse;
import vn.backend.backend.common.SplitMethod;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import java.util.ArrayList;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseParticipantService expenseParticipantService;
    private final BalanceService balanceService;
    private final GroupMembersRepository groupMemberRepository;
    private final TransactionService transactionService;

    @Override
    @Transactional
    public ExpenseDetailResponse createExpense(Long groupId, CreateExpenseRequest request, Long createdByUserId) {
        // Kiểm tra nhóm tồn tại
        var group = groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm với ID: " + groupId));

        // Kiểm tra tính nhất quán giữa groupId trong path và trong request
        if (request.getGroupId() != null && !groupId.equals(request.getGroupId())) {
            throw new IllegalArgumentException("Group ID trong đường dẫn không khớp với Group ID trong request");
        }

        // Kiểm tra người tạo chi phí có trong nhóm không
        if (!isUserInGroup(createdByUserId, groupId)) {
            throw new RuntimeException("Người tạo chi phí không phải là thành viên của nhóm");
        }

        // Kiểm tra người trả tiền có trong nhóm không
        if (!isUserInGroup(request.getPayerId(), groupId)) {
            throw new RuntimeException("Người trả tiền không phải là thành viên của nhóm");
        }

        // Kiểm tra tất cả người tham gia có trong nhóm không
        for (CreateExpenseRequest.ParticipantShareRequest participant : request.getParticipants()) {
            if (!isUserInGroup(participant.getUserId(), groupId)) {
                throw new RuntimeException("Người tham gia có ID " + participant.getUserId() +
                        " không phải là thành viên của nhóm");
            }
        }

        // 1. Tạo expense entity
        ExpenseEntity expense = ExpenseEntity.builder()
                .group(group)
                .expenseName(request.getExpenseName())
                .totalAmount(request.getTotalAmount())
                .currency(request.getCurrency())
                .category(categoryRepository.findById(request.getCategoryId()).orElseThrow())
                .expenseDate(request.getExpenseDate())
                .description(request.getDescription())
                .createdBy(userRepository.findById(createdByUserId).orElseThrow())
                .payer(userRepository.findById(request.getPayerId()).orElseThrow())
                .splitMethod(request.getSplitMethod())
                .build();

        ExpenseEntity savedExpense = expenseRepository.save(expense);

        // 2. Tạo participants
        List<ExpenseParticipantEntity> participants = new ArrayList<>();
        List<ExpenseParticipantResponse> participantResponses = new ArrayList<>();

        for (CreateExpenseRequest.ParticipantShareRequest participant : request.getParticipants()) {
            ExpenseParticipantEntity participantEntity = expenseParticipantService.addParticipant(
                    savedExpense.getExpenseId(),
                    participant.getUserId(),
                    participant.getShareAmount()
            );
            participants.add(participantEntity);

            // Convert luôn sang response
            ExpenseParticipantResponse participantResponse = ExpenseParticipantResponse.builder()
                    .participantId(participantEntity.getParticipantId())
                    .expenseId(participantEntity.getExpense().getExpenseId())
                    .expenseName(participantEntity.getExpense().getExpenseName())
                    .userId(participantEntity.getUser().getUserId())
                    .userName(participantEntity.getUser().getFullName())
                    .userEmail(participantEntity.getUser().getEmail())
                    .shareAmount(participantEntity.getShareAmount())
                    .currency(participantEntity.getExpense().getCurrency())
                    .build();
            participantResponses.add(participantResponse);
        }

        // 3. Cập nhật balance và tạo transactions
        // Cập nhật số dư cho tất cả người tham gia
        balanceService.updateBalancesForExpense(savedExpense, participants);
        // Tạo transaction cho hành động tạo chi phí
        transactionService.createTransaction(
                groupId,
                createdByUserId,
                ActionType.create,
                EntityType.expense,
                savedExpense.getExpenseId()
        );
        // 4. Return response trực tiếp
        return ExpenseDetailResponse.builder()
                .expenseId(savedExpense.getExpenseId())
                .groupId(savedExpense.getGroup().getGroupId())
                .groupName(savedExpense.getGroup().getGroupName())
                .expenseName(savedExpense.getExpenseName())
                .totalAmount(savedExpense.getTotalAmount())
                .currency(savedExpense.getCurrency())
                .categoryId(savedExpense.getCategory().getCategoryId())
                .categoryName(savedExpense.getCategory().getCategoryName())
                .expenseDate(savedExpense.getExpenseDate())
                .description(savedExpense.getDescription())
                .createdByUserId(savedExpense.getCreatedBy().getUserId())
                .createdByUserName(savedExpense.getCreatedBy().getFullName())
                .payerUserId(savedExpense.getPayer().getUserId())
                .payerUserName(savedExpense.getPayer().getFullName())
                .splitMethod(savedExpense.getSplitMethod())
                .createdAt(savedExpense.getCreatedAt())
                .updatedAt(savedExpense.getUpdatedAt())
                .participants(participantResponses)
                .totalParticipants(participantResponses.size())
                .build();
    }

    // Phương thức helper để kiểm tra xem một người dùng có trong nhóm hay không
    private boolean isUserInGroup(Long userId, Long groupId) {
        return groupMemberRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId);
    }

    @Override
    @Transactional
    public ExpenseEntity updateExpense(Long expenseId, String expenseName, BigDecimal amount,
                                       String currency, Long categoryId, Date expenseDate,
                                       String description, SplitMethod splitMethod) {
        var expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expense.setExpenseName(expenseName);
        expense.setTotalAmount(amount);
        expense.setCurrency(currency);
        expense.setCategory(categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found")));
        expense.setExpenseDate(expenseDate);
        expense.setDescription(description);
        expense.setSplitMethod(splitMethod);
        return expenseRepository.save(expense);
    }

    @Override
    public void deleteExpense(Long expenseId) {
        expenseRepository.deleteById(expenseId);
    }

    @Override
    public List<ExpenseEntity> getExpensesByGroupId(Long groupId) {
        return expenseRepository.findAllByGroupGroupId(groupId);
    }

    @Override
    public List<ExpenseEntity> getExpensesByPayerId(Long payerId) {
        return expenseRepository.findAllByPayerUserId(payerId);
    }
}
