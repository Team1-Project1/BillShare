package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.repository.criteria.ExpenseCriteriaRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long>, ExpenseCriteriaRepository {
    List<ExpenseEntity> findAllByGroupGroupId(Long groupId);
    Optional<ExpenseEntity> findByExpenseId(Long expenseId);
    List<ExpenseEntity> findAllByPayerUserId(Long payerId);
}
