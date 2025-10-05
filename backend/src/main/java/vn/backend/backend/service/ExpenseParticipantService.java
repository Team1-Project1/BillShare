package vn.backend.backend.service;

import vn.backend.backend.model.ExpenseParticipantEntity;
import java.math.BigDecimal;
import java.util.List;

public interface ExpenseParticipantService {
    ExpenseParticipantEntity addParticipant(Long expenseId, Long userId, BigDecimal shareAmount);
    void updateParticipantShare(Long participantId, BigDecimal newShareAmount);
    void removeParticipant(Long participantId);
    List<ExpenseParticipantEntity> getParticipantsByExpenseId(Long expenseId);
    List<ExpenseParticipantEntity> getParticipantsByUserId(Long userId);
}
