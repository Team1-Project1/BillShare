package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.backend.model.ExpenseParticipantEntity;
import vn.backend.backend.repository.ExpenseParticipantRepository;
import vn.backend.backend.repository.ExpenseRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.ExpenseParticipantService;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseParticipantServiceImpl implements ExpenseParticipantService {
    private final ExpenseParticipantRepository participantRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    @Override
    public ExpenseParticipantEntity addParticipant(Long expenseId, Long userId, BigDecimal shareAmount) {
        var expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return participantRepository.save(ExpenseParticipantEntity.builder()
                .expense(expense)
                .user(user)
                .shareAmount(shareAmount)
                .build());
    }

    @Override
    public void removeParticipant(Long participantId) {
        participantRepository.deleteById(participantId);
    }

    @Override
    public List<ExpenseParticipantEntity> getParticipantsByExpenseId(Long expenseId) {
        return participantRepository.findAllByExpenseExpenseId(expenseId);
    }

    @Override
    public List<ExpenseParticipantEntity> getParticipantsByUserId(Long userId) {
        return participantRepository.findAllByUserUserId(userId);
    }

    @Override
    public void updateParticipantShare(Long participantId, BigDecimal newShareAmount) {
        var participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        participant.setShareAmount(newShareAmount);
        participantRepository.save(participant);
    }
}
