package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.model.ExpenseParticipantEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipantEntity, Long> {
    List<ExpenseParticipantEntity> findAllByExpenseExpenseIdAndExpenseDeletedAtIsNull(Long expenseId);
    List<ExpenseParticipantEntity> findAllByUserUserIdAndExpenseDeletedAtIsNull(Long userId);
    void deleteAllByExpenseExpenseId(Long expenseId);
    List<ExpenseParticipantEntity>  findAllByExpenseExpenseId(Long expenseId);

    Optional<ExpenseParticipantEntity> findByParticipantIdAndExpenseDeletedAtIsNull(Long groupId);
    List<ExpenseParticipantEntity> findAllByExpense_Group_GroupIdAndUser_UserId(Long groupId, Long userId);
}

