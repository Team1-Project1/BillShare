package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.backend.model.BalanceEntity;
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
