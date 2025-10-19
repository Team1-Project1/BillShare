package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.model.ExpenseParticipantEntity;

import java.util.List;

@Repository
public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipantEntity, Long> {
    List<ExpenseParticipantEntity> findAllByExpenseExpenseId(Long expenseId);
    List<ExpenseParticipantEntity> findAllByUserUserId(Long userId);
    void deleteAllByExpenseExpenseId(Long expenseId);
    List<ExpenseParticipantEntity> findAllByExpense_Group_GroupId(Long groupId);
    List<ExpenseParticipantEntity> findAllByExpense_Group_GroupIdAndUser_UserId(Long groupId, Long userId);
}

