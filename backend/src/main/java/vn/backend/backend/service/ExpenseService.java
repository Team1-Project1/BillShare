package vn.backend.backend.service;

import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.controller.request.CreateExpenseRequest;
import vn.backend.backend.controller.response.ExpenseDetailResponse;
import vn.backend.backend.common.SplitMethod;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public interface ExpenseService {
    ExpenseDetailResponse createExpense(Long groupId, CreateExpenseRequest request, Long createdByUserId);
    ExpenseEntity updateExpense(Long expenseId, String expenseName, BigDecimal amount,
                                String currency, Long categoryId, Date expenseDate,
                                String description, SplitMethod splitMethod);
    void deleteExpense(Long expenseId, Long requestingUserId, Long groupId);
    List<ExpenseEntity> getExpensesByGroupId(Long groupId);
    List<ExpenseEntity> getExpensesByPayerId(Long payerId);
}

