package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.TransactionEntity;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    Page<TransactionEntity> findAllByGroupGroupId(Long groupId, Pageable pageable);
    List<TransactionEntity> findAllByUserUserId(Long userId);
}

