package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.model.BalanceEntity;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.model.ExpenseParticipantEntity;
import vn.backend.backend.repository.BalanceRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.BalanceService;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BalanceServiceImpl implements BalanceService {
    private final BalanceRepository balanceRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    @Override
    public BalanceEntity createBalance(Long groupId, Long userId1, Long userId2, BigDecimal amount) {
        var group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        var user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User 1 not found"));
        var user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User 2 not found"));

        return balanceRepository.save(BalanceEntity.builder()
                .group(group)
                .user1(user1)
                .user2(user2)
                .balance(amount)
                .build());
    }

    private void updateOrCreateBalance(Long groupId, Long userId1, Long userId2, BigDecimal amount) {
        // Đảm bảo user_id_1 < user_id_2 (LEAST/GREATEST)
        Long smallerId = Math.min(userId1, userId2);
        Long largerId = Math.max(userId1, userId2);

        // Tìm balance với thứ tự đúng
        BalanceEntity balance = balanceRepository
                .findByGroupGroupIdAndUser1UserIdAndUser2UserId(groupId, smallerId, largerId)
                .orElse(null);

        if (balance != null) {
            // Cập nhật balance hiện có
            BigDecimal newBalance;

            if (userId1.equals(smallerId)) {
                // userId1 là user nhỏ hơn (user_id_1)
                // userId1 nợ userId2 → balance tăng
                newBalance = balance.getBalance().add(amount);
            } else {
                // userId1 là user lớn hơn (user_id_2)
                // userId2 nợ userId1 → balance giảm
                newBalance = balance.getBalance().subtract(amount);
            }

            balance.setBalance(newBalance);
            balanceRepository.save(balance);
        } else {
            // Tạo balance mới
            createNewBalance(groupId, smallerId, largerId, userId1, amount);
        }
    }

    @Override
    @Transactional
    public void updateBalancesForExpense(ExpenseEntity expense, List<ExpenseParticipantEntity> participants) {
        Long payerId = expense.getPayer().getUserId();
        Long groupId = expense.getGroup().getGroupId();

        for (ExpenseParticipantEntity participant : participants) {
            Long participantUserId = participant.getUser().getUserId();
            BigDecimal shareAmount = participant.getShareAmount();

            // Chỉ cập nhật balance cho những người không phải payer
            if (!participantUserId.equals(payerId)) {
                updateOrCreateBalance(groupId, participantUserId, payerId, shareAmount);
            }
        }
    }

    // In BalanceServiceImpl.java
    @Override
    @Transactional
    public void updateBalancesAfterExpenseDeletion(Long groupId, Long payerId, List<ExpenseParticipantEntity> participants) {

        for (ExpenseParticipantEntity participant : participants) {
            Long participantUserId = participant.getUser().getUserId();
            BigDecimal shareAmount = participant.getShareAmount();

            if (!participantUserId.equals(payerId)) {
                // Reverse the balance update: subtract shareAmount trừ ngược lại
                updateOrCreateBalance(groupId, participantUserId, payerId, shareAmount.negate());
            }
        }
    }


    private void createNewBalance(Long groupId, Long smallerId, Long largerId, Long debtorId, BigDecimal amount) {
        BalanceEntity newBalance = new BalanceEntity();
        newBalance.setGroup(groupRepository.getReferenceById(groupId));
        newBalance.setUser1(userRepository.getReferenceById(smallerId));
        newBalance.setUser2(userRepository.getReferenceById(largerId));

        // Xác định dấu của balance
        if (debtorId.equals(smallerId)) {
            // smallerId nợ largerId → balance dương
            newBalance.setBalance(amount);
        } else {
            // largerId nợ smallerId → balance âm
            newBalance.setBalance(amount.negate());
        }

        balanceRepository.save(newBalance);
    }
    @Override
    public BalanceEntity updateBalance(Long balanceId, BigDecimal newAmount) {
        var balance = balanceRepository.findById(balanceId)
                .orElseThrow(() -> new RuntimeException("Balance not found"));
        balance.setBalance(newAmount);
        return balanceRepository.save(balance);
    }

    @Override
    public List<BalanceEntity> getBalancesByGroupId(Long groupId) {
        return balanceRepository.findAllByGroupGroupId(groupId);
    }

    @Override
    public BalanceEntity getBalanceBetweenUsers(Long groupId, Long userId1, Long userId2) {
        return balanceRepository.findByGroupGroupIdAndUser1UserIdAndUser2UserId(groupId, userId1, userId2)
                .orElseThrow(() -> new RuntimeException("Balance not found"));
    }
}
