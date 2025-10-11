package vn.backend.backend.repository.criteria;

import vn.backend.backend.model.ExpenseEntity;

import java.util.Date;
import java.util.List;

public interface  ExpenseCriteriaRepository {
    List<ExpenseEntity> searchExpenses(Long categoryId, String expenseName, Date expenseDateFrom, Date expenseDateTo,Long userId,Long groupId);
}



