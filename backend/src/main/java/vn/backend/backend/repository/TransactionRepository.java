package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.TransactionEntity;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findAllByGroupGroupId(Long groupId);
    List<TransactionEntity> findAllByUserUserId(Long userId);
    List<TransactionEntity> findAllByActionType(String actionType);
    List<TransactionEntity> findAllByEntityTypeAndEntityId(String entityType, Long entityId);
}

