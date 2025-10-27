package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.controller.request.UpdateExpenseRequest;
import vn.backend.backend.controller.response.ExpenseSimpleResponse;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.model.ExpenseParticipantEntity;
import vn.backend.backend.model.GroupMembersEntity;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.ExpenseService;
import vn.backend.backend.service.ExpenseParticipantService;
import vn.backend.backend.service.BalanceService;
import vn.backend.backend.service.TransactionService;
import vn.backend.backend.controller.request.CreateExpenseRequest;
import vn.backend.backend.controller.response.ExpenseDetailResponse;
import vn.backend.backend.controller.response.ExpenseResponse;
import vn.backend.backend.controller.response.ExpenseParticipantResponse;
import vn.backend.backend.common.SplitMethod;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;

import java.time.ZoneId;
import java.util.ArrayList;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.NoSuchElementException;
@Slf4j
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
    private final GroupMembersRepository groupMembersRepository;
    private final ExpenseParticipantRepository expenseParticipantRepository;

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
                .currency(group.getDefaultCurrency())
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
    @Transactional
    public void deleteExpense(Long expenseId, Long requestingUserId, Long groupId) {
        // 1. Find expense
        ExpenseEntity expense = expenseRepository.findByExpenseId(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        Long payerId = expense.getPayer().getUserId();
        // 2. Validate creator
        if (!expense.getCreatedBy().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Only the creator can delete this expense");
        }

        // 3. Get participants before delete (lưu data cần thiết)
        List<ExpenseParticipantEntity> participants = expenseParticipantService.getParticipantsByExpenseId(expenseId);
        // Có thể extract data từ expense nếu cần, ví dụ: double totalAmount = expense.getAmount();

        // 4. Update balances – Truyền data extract, không truyền expense
        balanceService.updateBalancesAfterExpenseDeletion(groupId, payerId, participants);  // Thay đổi signature

        // 5.delete participant
        expenseParticipantService.removeAllParticipantsByExpenseId(expenseId);
        // 6. Delete expense
        expenseRepository.deleteById(expenseId);

        // 7. Create transaction – Chỉ dùng ID
        transactionService.createTransaction(
                groupId,
                requestingUserId,
                ActionType.delete,
                EntityType.expense,
                expenseId
        );
    }


    @Override
    public Page<ExpenseResponse> getExpensesByGroupId(Long groupId, Long userId, int page, int size) {
        //Verify user is in group
        if (!isUserInGroup(userId, groupId)) {
            throw new RuntimeException("Không phải là thành viên của nhóm");
        }
        // Verify group exists
        groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with ID: " + groupId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("expenseDate").descending());
        Page<ExpenseEntity> expensesPage = expenseRepository.findAllByGroupGroupId(groupId, pageable);
        return  expensesPage.map(expense -> ExpenseResponse.builder()
                .expenseId(expense.getExpenseId())
                .groupId(expense.getGroup().getGroupId())
                .groupName(expense.getGroup().getGroupName())
                .expenseName(expense.getExpenseName())
                .totalAmount(expense.getTotalAmount())
                .currency(expense.getCurrency())
                .categoryId(expense.getCategory().getCategoryId())
                .categoryName(expense.getCategory().getCategoryName())
                .expenseDate(expense.getExpenseDate())
                .description(expense.getDescription())
                .createdByUserId(expense.getCreatedBy().getUserId())
                .createdByUserName(expense.getCreatedBy().getFullName())
                .payerUserId(expense.getPayer().getUserId())
                .payerUserName(expense.getPayer().getFullName())
                .splitMethod(expense.getSplitMethod())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build());
    }
    @Override
    public ExpenseDetailResponse getExpenseDetail(Long expenseId, Long userId, Long groupId) {
        //Verify user is in group
        if (!isUserInGroup(userId, groupId)) {
            throw new RuntimeException("Không phải là thành viên của nhóm");
        }

        ExpenseEntity expense = expenseRepository.findByExpenseId(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found with ID: " + expenseId));

        List<ExpenseParticipantEntity> participants = expenseParticipantService.getParticipantsByExpenseId(expenseId);

        List<ExpenseParticipantResponse> participantResponses = participants.stream()
                .map(participant -> ExpenseParticipantResponse.builder()
                        .participantId(participant.getParticipantId())
                        .expenseId(participant.getExpense().getExpenseId())
                        .expenseName(participant.getExpense().getExpenseName())
                        .userId(participant.getUser().getUserId())
                        .userName(participant.getUser().getFullName())
                        .userEmail(participant.getUser().getEmail())
                        .shareAmount(participant.getShareAmount())
                        .currency(participant.getExpense().getCurrency())
                        .build())
                .toList();

        return ExpenseDetailResponse.builder()
                .expenseId(expense.getExpenseId())
                .groupId(expense.getGroup().getGroupId())
                .groupName(expense.getGroup().getGroupName())
                .expenseName(expense.getExpenseName())
                .totalAmount(expense.getTotalAmount())
                .currency(expense.getCurrency())
                .categoryId(expense.getCategory().getCategoryId())
                .categoryName(expense.getCategory().getCategoryName())
                .expenseDate(expense.getExpenseDate())
                .description(expense.getDescription())
                .createdByUserId(expense.getCreatedBy().getUserId())
                .createdByUserName(expense.getCreatedBy().getFullName())
                .payerUserId(expense.getPayer().getUserId())
                .payerUserName(expense.getPayer().getFullName())
                .splitMethod(expense.getSplitMethod())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .participants(participantResponses)
                .totalParticipants(participantResponses.size())
                .build();
    }


    @Override
    public List<ExpenseEntity> getExpensesByPayerId(Long payerId) {
        return expenseRepository.findAllByPayerUserId(payerId);
    }
    @Transactional
    @Override
    public ExpenseDetailResponse updateExpenseByExpenseId(Long expenseId, Long userId,Long groupId,UpdateExpenseRequest request) {
        ExpenseEntity expense=expenseRepository.findByExpenseId(expenseId).orElseThrow(()->new NoSuchElementException("Expense not found with ID: " + expenseId));
        if(!expense.getCreatedBy().getUserId().equals(userId)){
            throw new RuntimeException("Only the creator can update this expense");
        }
        UserEntity payer=userRepository.findById(request.getPayerId()).orElseThrow(()->new NoSuchElementException("User not found with ID: " + request.getPayerId()));
        boolean groupMember=groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(expense.getGroup().getGroupId(),request.getPayerId());
        if (!groupMember){
            throw new RuntimeException("The payer is not a member of the group");
        }
        for(var participant:request.getParticipants()){
            Boolean isMember=groupMemberRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(expense.getGroup().getGroupId(),participant.getUserId());
            if(!isMember){
                throw new RuntimeException("Participant with ID " + participant.getUserId() +
                        " is not a member of the group");
            }
        }
        BigDecimal totalShareAmount = BigDecimal.ZERO; // tổng số tiền đã chia
        for (var participant : request.getParticipants()) {
            totalShareAmount = totalShareAmount.add(participant.getShareAmount());
        }
        if(totalShareAmount.compareTo(request.getTotalAmount()) != 0){
            throw new RuntimeException("The total share amount of participants does not equal to the total expense amount");
        }
        long oldPayerId=expense.getPayer().getUserId();
        List<ExpenseParticipantEntity>oldParticipants=expenseParticipantRepository.findAllByExpenseExpenseId(expenseId);

        expense.setPayer(payer);
        expense.setExpenseName(request.getExpenseName());
        expense.setTotalAmount(request.getTotalAmount());
        expense.setCategory(categoryRepository.findById(request.getCategoryId()).orElseThrow(()->new NoSuchElementException("Category not found with ID: " + request.getCategoryId())));
        expense.setExpenseDate(request.getExpenseDate());
        expense.setDescription(request.getDescription());
        expense.setSplitMethod(request.getSplitMethod());
        ExpenseEntity updatedExpense = expenseRepository.save(expense);


        expenseParticipantRepository.deleteAllByExpenseExpenseId(expenseId);
        expenseParticipantRepository.flush();
        boolean deleted = expenseParticipantRepository
                .findAllByExpenseExpenseId(expenseId)
                .isEmpty();
        if(deleted){
            log.info("da xoa het");
        }
        else {
            log.info("Chua xoa het");
        }


        List<ExpenseParticipantEntity> newParticipants = new ArrayList<>();
        List<ExpenseParticipantResponse> participantResponses = new ArrayList<>();

        for(var participant:request.getParticipants()){
            ExpenseParticipantEntity participantEntity = expenseParticipantService.addParticipant(
                    updatedExpense.getExpenseId(),
                    participant.getUserId(),
                    participant.getShareAmount()
            );
            newParticipants.add(participantEntity);
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
        balanceService.rollBackBalance(expense,oldPayerId,oldParticipants);
        balanceService.updateBalancesForExpense(expense,newParticipants);
        transactionService.createTransaction(
                expense.getGroup().getGroupId(),
                userId,
                ActionType.update,
                EntityType.expense,
                expenseId
        );
        return ExpenseDetailResponse.builder()
                .expenseId(updatedExpense.getExpenseId())
                .groupId(updatedExpense.getGroup().getGroupId())
                .groupName(updatedExpense.getGroup().getGroupName())
                .expenseName(updatedExpense.getExpenseName())
                .totalAmount(updatedExpense.getTotalAmount())
                .currency(updatedExpense.getCurrency())
                .categoryId(updatedExpense.getCategory().getCategoryId())
                .categoryName(updatedExpense.getCategory().getCategoryName())
                .expenseDate(updatedExpense.getExpenseDate())
                .description(updatedExpense.getDescription())
                .createdByUserId(updatedExpense.getCreatedBy().getUserId())
                .createdByUserName(updatedExpense.getCreatedBy().getFullName())
                .payerUserId(updatedExpense.getPayer().getUserId())
                .payerUserName(updatedExpense.getPayer().getFullName())
                .splitMethod(updatedExpense.getSplitMethod())
                .createdAt(updatedExpense.getCreatedAt())
                .updatedAt(updatedExpense.getUpdatedAt())
                .participants(participantResponses)
                .totalParticipants(participantResponses.size())
                .build();
    }

    @Override
    public List<ExpenseSimpleResponse> getExpensesByConditions(Long categoryId, String expenseName, Date expenseDateFrom, Date expenseDateTo, Long userId, Long groupId) {
        Boolean groupMember=groupMemberRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId,userId);
        if(!groupMember){
            throw new RuntimeException("User is not a member of the group");
        }
        List<ExpenseEntity> expenses=expenseRepository.searchExpenses(categoryId, expenseName, expenseDateFrom, expenseDateTo,userId,groupId);
        return expenses.stream().map(expense->ExpenseSimpleResponse.builder()
                .expenseId(expense.getExpenseId())
                .categoryId(expense.getCategory().getCategoryId())
                .expenseName(expense.getExpenseName())
                .expenseDate(expense.getExpenseDate().toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate())
                .build()).toList();
    }
}
