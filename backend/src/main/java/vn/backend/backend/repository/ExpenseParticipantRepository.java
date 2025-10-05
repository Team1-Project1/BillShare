package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.ExpenseParticipantEntity;

import java.util.List;

@Repository
public interface ExpenseParticipantRepository extends JpaRepository<ExpenseParticipantEntity, Long> {
    List<ExpenseParticipantEntity> findAllByExpenseExpenseId(Long expenseId);
    List<ExpenseParticipantEntity> findAllByUserUserId(Long userId);
}

