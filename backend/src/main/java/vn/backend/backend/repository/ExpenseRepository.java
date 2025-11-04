package vn.backend.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.repository.criteria.ExpenseCriteriaRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long>, ExpenseCriteriaRepository {
    List<ExpenseEntity> findAllByGroupGroupIdAndDeletedAtIsNull(Long groupId);
    Page<ExpenseEntity> findAllByGroupGroupIdAndDeletedAtIsNull(Long groupId, Pageable pageable);
    Optional<ExpenseEntity> findByExpenseIdAndDeletedAtIsNull(Long expenseId);
    List<ExpenseEntity> findAllByPayerUserIdAndDeletedAtIsNull(Long payerId);
    void deleteByGroup_GroupId(Long groupId);
    Optional<ExpenseEntity> findByExpenseIdAndDeletedAtIsNotNull(Long expenseId);

}
