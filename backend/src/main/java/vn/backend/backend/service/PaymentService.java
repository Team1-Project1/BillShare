package vn.backend.backend.service;

import vn.backend.backend.controller.request.PaymentRequest;
import vn.backend.backend.controller.response.PaymentResponse;
import vn.backend.backend.model.PaymentEntity;

import java.util.List;

public interface PaymentService {
    PaymentResponse createPayment(Long groupId, PaymentRequest request, Long createdByUserId);
    PaymentResponse updatePayment(Long paymentId, PaymentRequest request, Long requestingUserId, Long groupId);
    void deletePayment(Long paymentId, Long requestingUserId, Long groupId);
    List<PaymentResponse> getPaymentsByGroupId(Long groupId, Long userId);
    PaymentResponse getPaymentDetail(Long paymentId, Long userId, Long groupId);
    List<PaymentEntity> getPaymentsByPayerId(Long payerId);
    List<PaymentEntity> getPaymentsByPayeeId(Long payeeId);
}
