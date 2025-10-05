package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.ExpenseService;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public ExpenseEntity createExpense(Long groupId, String expenseName, BigDecimal amount,
                                       String currency, Long categoryId, Date expenseDate,
                                       String description, Long payerId, String splitMethod) {
        var group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        var payer = userRepository.findById(payerId)
                .orElseThrow(() -> new RuntimeException("Payer not found"));
        var category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        return expenseRepository.save(ExpenseEntity.builder()
                .group(group)
                .expenseName(expenseName)
                .totalAmount(amount)
                .currency(currency)
                .category(category)
                .expenseDate(expenseDate)
                .description(description)
                .payer(payer)
                .splitMethod(splitMethod)
                .build());
    }

    @Override
    @Transactional
    public ExpenseEntity updateExpense(Long expenseId, String expenseName, BigDecimal amount,
                                String currency, Long categoryId, Date expenseDate,
                                String description, String splitMethod) {
        var expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        expense.setExpenseName(expenseName);
        expense.setTotalAmount(amount);
        expense.setCurrency(currency);
        expense.setCategory(categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found")));
        expense.setExpenseDate(expenseDate);
        expense.setDescription(description);
        expense.setSplitMethod(splitMethod);
        return expenseRepository.save(expense);
    }

    @Override
    public void deleteExpense(Long expenseId) {
        expenseRepository.deleteById(expenseId);
    }

    @Override
    public List<ExpenseEntity> getExpensesByGroupId(Long groupId) {
        return expenseRepository.findAllByGroupGroupId(groupId);
    }

    @Override
    public List<ExpenseEntity> getExpensesByPayerId(Long payerId) {
        return expenseRepository.findAllByPayerUserId(payerId);
    }
}
