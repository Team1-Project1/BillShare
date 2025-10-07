package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.request.CreateExpenseRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.ExpenseDetailResponse;
import vn.backend.backend.controller.response.ExpenseResponse;
import vn.backend.backend.service.ExpenseService;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@Tag(name = "Expense Management")
@Slf4j(topic = "expense-controller")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @Operation(summary = "Create new expense", description = "API to add a new expense to a specific group")
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseDetailResponse>> createExpense(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateExpenseRequest request,
            @RequestHeader("userId") Long userId) {

        ExpenseDetailResponse expense = expenseService.createExpense(groupId, request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Chi tiêu đã được tạo thành công!", expense));
    }

    @Operation(summary = "Delete expense", description = "API to delete an expense from a group")
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<String>> deleteExpense(
            @PathVariable Long groupId,
            @PathVariable Long expenseId,
            @RequestHeader("userId") Long userId) {

        expenseService.deleteExpense(expenseId, userId, groupId);
        return ResponseEntity.ok(new ApiResponse<>("success", "Expense deleted successfully", null));
    }


//    @Operation(summary = "Get list of expenses by group", description = "API to get all expenses in a specific group")
//    @GetMapping
//    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getGroupExpenses(
//            @PathVariable Long groupId,
//            @RequestHeader("userId") Long userId) {
//
//        List<ExpenseResponse> expenses = expenseService.getExpensesByGroup(groupId, userId);
//
//        return ResponseEntity.ok(
//                new ApiResponse<>("success", "Lấy danh sách chi tiêu thành công", expenses)
//        );
//    }

//    @Operation(summary = "Get expense detail", description = "API to get detailed information about a specific expense")
//    @GetMapping("/{expenseId}")
//    public ResponseEntity<ApiResponse<ExpenseDetailResponse>> getExpenseDetail(
//            @PathVariable Long groupId,
//            @PathVariable Long expenseId,
//            @RequestHeader("userId") Long userId) {
//
//        ExpenseDetailResponse expense = expenseService.getExpenseDetail(groupId, expenseId, userId);
//
//        return ResponseEntity.ok(
//                new ApiResponse<>("success", String.format("Lấy thông tin chi tiết chi tiêu %d thành công", expenseId), expense)
//        );
//    }
//
//    @Operation(summary = "Update expense", description = "API to update an existing expense in a group")
//    @PutMapping("/{expenseId}")
//    public ResponseEntity<ApiResponse<ExpenseDetailResponse>> updateExpense(
//            @PathVariable Long groupId,
//            @PathVariable Long expenseId,
//            @Valid @RequestBody UpdateExpenseRequest request,
//            @RequestHeader("userId") Long userId) {
//
//        ExpenseDetailResponse expense = expenseService.updateExpense(groupId, expenseId, request, userId);
//
//        return ResponseEntity.ok(
//                new ApiResponse<>("success", String.format("Cập nhật chi tiêu %d thành công!", expenseId), expense)
//        );
//    }
//

}
