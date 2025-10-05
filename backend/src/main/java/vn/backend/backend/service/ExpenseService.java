package vn.backend.backend.service;

import vn.backend.backend.model.ExpenseEntity;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public interface ExpenseService {
    ExpenseEntity createExpense(Long groupId, String expenseName, BigDecimal amount,
                                String currency, Long categoryId, Date expenseDate,
                                String description, Long payerId, String splitMethod);
    ExpenseEntity updateExpense(Long expenseId, String expenseName, BigDecimal amount,
                                String currency, Long categoryId, Date expenseDate,
                                String description, String splitMethod);
    void deleteExpense(Long expenseId);
    List<ExpenseEntity> getExpensesByGroupId(Long groupId);
    List<ExpenseEntity> getExpensesByPayerId(Long payerId);
}
