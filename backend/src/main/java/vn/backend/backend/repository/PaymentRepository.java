package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.PaymentEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    List<PaymentEntity> findAllByGroupGroupId(Long groupId);
    List<PaymentEntity> findAllByPayerUserId(Long payerId);
    List<PaymentEntity> findAllByPayeeUserId(Long payeeId);
    Optional<PaymentEntity> findByPaymentId(Long paymentId);
}

