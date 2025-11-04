package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
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

}

