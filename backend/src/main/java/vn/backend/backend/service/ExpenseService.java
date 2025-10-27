package vn.backend.backend.service;

import org.springframework.data.domain.Page;
import vn.backend.backend.controller.request.UpdateExpenseRequest;
import vn.backend.backend.controller.response.ExpenseSimpleResponse;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.controller.request.CreateExpenseRequest;
import vn.backend.backend.controller.response.ExpenseDetailResponse;
import vn.backend.backend.controller.response.ExpenseResponse;
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
    Page<ExpenseResponse> getExpensesByGroupId(Long groupId, Long userId, int page, int size);
    ExpenseDetailResponse getExpenseDetail(Long expenseId, Long userId, Long groupId);
    List<ExpenseEntity> getExpensesByPayerId(Long payerId);
    ExpenseDetailResponse updateExpenseByExpenseId(Long expenseId,Long userId, Long groupId,UpdateExpenseRequest request);
    List<ExpenseSimpleResponse>getExpensesByConditions(Long categoryId, String expenseName, Date expenseDateFrom, Date expenseDateTo, Long userId, Long groupId);
}

