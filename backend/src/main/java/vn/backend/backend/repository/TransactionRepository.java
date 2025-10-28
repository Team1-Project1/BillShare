package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.TransactionEntity;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.backend.backend.controller.response.TransactionResponse;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    Page<TransactionEntity> findAllByGroupGroupId(Long groupId, Pageable pageable);
    List<TransactionEntity> findAllByUserUserId(Long userId);

    @Query("""
    SELECT new vn.backend.backend.controller.response.TransactionResponse(
        t.transactionId,
        t.group.groupId,
        t.group.groupName,
        t.user.userId,
        t.user.fullName,
        t.actionType,
        t.entityType,
        t.entityId,
        t.timestamp
    )
    FROM TransactionEntity t
    WHERE t.group IN (
        SELECT gm.group 
        FROM GroupMembersEntity gm 
        WHERE gm.member.userId = :userId AND gm.isActive = true
    )
    """)
    @EntityGraph(attributePaths = {"user", "group"})
    Page<TransactionResponse> findTransactionsByUserActiveGroups(
            @Param("userId") Long userId,
            Pageable pageable
    );
}

