package vn.backend.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.model.PaymentEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    List<PaymentEntity> findAllByGroupGroupIdAndDeletedAtIsNull(Long groupId);
    List<PaymentEntity> findAllByPayerUserIdAndDeletedAtIsNull(Long payerId);
    List<PaymentEntity> findAllByPayeeUserIdAndDeletedAtIsNull(Long payeeId);
    Optional<PaymentEntity> findByPaymentIdAndDeletedAtIsNull(Long paymentId);
    Optional<PaymentEntity> findByPaymentIdAndDeletedAtIsNotNull(Long paymentId);
    @Query("""
    SELECT p FROM PaymentEntity p
    WHERE p.deletedAt IS NOT NULL
    AND (
        (p.group.groupId = :groupId AND p.payer.userId = :userId)
        OR
        (p.group.groupId = :groupId AND p.payee.userId = :userId)
    )
    """)
    Page<PaymentEntity> findAllPaymentsByGroupAndPayerOrPayee(
            @Param("groupId") Long groupId,
            @Param("userId") Long userId,
            Pageable pageable
    );

}

