package vn.backend.backend.repository.criteria.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.model.ExpenseParticipantEntity;
import vn.backend.backend.repository.criteria.ExpenseCriteriaRepository;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
@Repository
@RequiredArgsConstructor
public class ExpenseCriteriaRepositoryImpl implements ExpenseCriteriaRepository {
    private final EntityManager entityManager;
    @Override
    public List<ExpenseEntity> searchExpenses(Long categoryId, String expenseName, Date expenseDateFrom, Date expenseDateTo,Long userId,Long groupId) {
        CriteriaBuilder criteriaBuilder=entityManager.getCriteriaBuilder();
        CriteriaQuery<ExpenseEntity>criteriaQuery=criteriaBuilder.createQuery(ExpenseEntity.class);
        Root<ExpenseEntity> expenseRoot=criteriaQuery.from(ExpenseEntity.class);

        List<Predicate>predicates=new ArrayList<>();

        predicates.add(criteriaBuilder.equal(expenseRoot.get("group").get("groupId"), groupId));

        Join<ExpenseEntity, ExpenseParticipantEntity> participantJoin = expenseRoot.join("expenseParticipants");
        predicates.add(criteriaBuilder.equal(participantJoin.get("user").get("userId"), userId));

        if(categoryId!=null){
            predicates.add(criteriaBuilder.equal((expenseRoot.get("category").get("categoryId")),categoryId));
        }

        if(expenseName!=null&&!expenseName.isEmpty()){
            predicates.add(criteriaBuilder.like(expenseRoot.get("expenseName"),"%"+expenseName+"%"));
        }

        if (expenseDateFrom != null && expenseDateTo != null) {
            predicates.add(criteriaBuilder.between(expenseRoot.get("expenseDate"), expenseDateFrom, expenseDateTo));
        } else if (expenseDateFrom != null) {
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(expenseRoot.get("expenseDate"), expenseDateFrom));
        } else if (expenseDateTo != null) {
            predicates.add(criteriaBuilder.lessThanOrEqualTo(expenseRoot.get("expenseDate"), expenseDateTo));
        }

        criteriaQuery.where(predicates.toArray(new Predicate[0])).orderBy(criteriaBuilder.desc(expenseRoot.get("expenseDate")));
        return entityManager.createQuery(criteriaQuery).getResultList();
    }
}
