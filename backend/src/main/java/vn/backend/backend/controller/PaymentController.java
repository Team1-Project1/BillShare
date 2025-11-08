package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.request.PaymentRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.PaymentResponse;
import vn.backend.backend.service.PaymentService;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/payments")
@Tag(name = "Payment Management")
@Slf4j(topic = "payment-controller")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Create new payment", description = "API to add a new payment between two users in a group")
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @PathVariable Long groupId,
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {

        Long userId = (Long) httpRequest.getAttribute("userId");
        PaymentResponse payment = paymentService.createPayment(groupId, request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Thanh toán đã được tạo thành công!", payment));
    }

    @Operation(summary = "Update payment", description = "API to update an existing payment in a group")
    @PutMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePayment(
            @PathVariable Long groupId,
            @PathVariable Long paymentId,
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest) {

        Long userId = (Long) httpRequest.getAttribute("userId");
        PaymentResponse payment = paymentService.updatePayment(paymentId, request, userId, groupId);

        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("Cập nhật thanh toán %d thành công!", paymentId), payment)
        );
    }

    @Operation(summary = "Delete payment", description = "API to delete a payment from a group")
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<String>> deletePayment(
            @PathVariable Long groupId,
            @PathVariable Long paymentId,
            HttpServletRequest httpRequest) {

        Long userId = (Long) httpRequest.getAttribute("userId");
        paymentService.deletePayment(paymentId, userId, groupId);

        return ResponseEntity.ok(
                new ApiResponse<>("success", "Thanh toán đã được xóa thành công", null)
        );
    }

    @Operation(summary = "Get all payments in group", description = "API to retrieve all payments for a specific group")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getGroupPayments(
            @PathVariable Long groupId,
            HttpServletRequest httpRequest) {

        Long userId = (Long) httpRequest.getAttribute("userId");
        List<PaymentResponse> payments = paymentService.getPaymentsByGroupId(groupId, userId);

        return ResponseEntity.ok(
                new ApiResponse<>("success", "Lấy danh sách thanh toán thành công", payments)
        );
    }

    @Operation(summary = "Get payment detail", description = "API to get detailed information about a specific payment")
    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentDetail(
            @PathVariable Long groupId,
            @PathVariable Long paymentId,
            HttpServletRequest httpRequest) {

        Long userId = (Long) httpRequest.getAttribute("userId");
        PaymentResponse payment = paymentService.getPaymentDetail(paymentId, userId, groupId);

        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("Lấy thông tin chi tiết thanh toán %d thành công", paymentId), payment)
        );
    }

    @Operation(summary = "Restore payment", description = "Restore a deleted payment")
    @PutMapping("/{paymentId}/restore")
    public ResponseEntity<ApiResponse<Void>> restorePayment(
            @PathVariable Long groupId,
            @PathVariable Long paymentId,
            HttpServletRequest req) {

        Long userId = (Long) req.getAttribute("userId");
        paymentService.restorePayment(paymentId, userId, groupId);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        "Payment ID %d has been successfully restored!".formatted(paymentId),
                        null
                )
        );
    }

    @Operation(summary = "get all payment deleted", description = "API to get all payment  deleted in group")
    @GetMapping("/payement-deleted")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getAllPaymentDeleted(
            @PathVariable Long groupId,
            @RequestParam (defaultValue = "0") int page,
            @RequestParam (defaultValue = "10") int size,
            HttpServletRequest req) {

        Long userId = (Long) req.getAttribute("userId");
        var result= paymentService.getPaymentDeleted(groupId, userId, page,size);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        String.format("get all payment deleted of userId %d in group %d successfully",userId,groupId),
                        result
                )
        );
    }
}
