package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.request.CreateExpenseRequest;
import vn.backend.backend.controller.request.UpdateExpenseRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.ExpenseDetailResponse;
import vn.backend.backend.controller.response.ExpenseResponse;
import vn.backend.backend.controller.response.ExpenseSimpleResponse;
import vn.backend.backend.model.ExpenseEntity;
import vn.backend.backend.service.ExpenseService;

import java.util.Date;
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
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        ExpenseDetailResponse expense = expenseService.createExpense(groupId, request, userId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>("success", "Chi tiêu đã được tạo thành công!", expense));
    }

    @Operation(summary = "Delete expense", description = "API to delete an expense from a group")
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<String>> deleteExpense(
            @PathVariable Long groupId,
            @PathVariable Long expenseId,
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        expenseService.deleteExpense(expenseId, userId, groupId);
        return ResponseEntity.ok(new ApiResponse<>("success", "Expense deleted successfully", null));
    }

    @Operation(summary = "Get all expenses in group", description = "API to retrieve all expenses for a specific group")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> getGroupExpenses(
            @PathVariable Long groupId,
            @RequestParam (defaultValue = "0") int page,
            @RequestParam (defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Page<ExpenseResponse> expenses = expenseService.getExpensesByGroupId(groupId, userId,page,size);

        return ResponseEntity.ok(
                new ApiResponse<>("success", "Lấy danh sách chi tiêu thành công", expenses)
        );
    }

    @Operation(summary = "Get expense detail", description = "API to get detailed information about a specific expense")
    @GetMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<ExpenseDetailResponse>> getExpenseDetail(
            @PathVariable Long groupId,
            @PathVariable Long expenseId,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        ExpenseDetailResponse expense = expenseService.getExpenseDetail(expenseId, userId, groupId);

        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("Lấy thông tin chi tiết chi tiêu %d thành công", expenseId), expense)
        );
    }


    @Operation(summary = "Update expense", description = "API to update an existing expense in a group")
    @PutMapping("/{expenseId}")
    public ResponseEntity<ApiResponse<ExpenseDetailResponse>> updateExpense(
            @PathVariable Long expenseId,
            @PathVariable Long groupId,
            @Valid @RequestBody UpdateExpenseRequest request,
            HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        ExpenseDetailResponse expense = expenseService.updateExpenseByExpenseId(expenseId,userId,groupId, request);

        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("Cập nhật chi tiêu %d thành công!", expenseId), expense)
        );
    }

    @Operation(summary = "get expenses by conditions", description = "API to update an existing expense in a group")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ExpenseSimpleResponse>>> getExpensesByConditions(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String expenseName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date expenseDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date expenseDateTo,
            HttpServletRequest req,
            @PathVariable Long groupId
    ){
        Long userId = (Long) req.getAttribute("userId");
        List<ExpenseSimpleResponse> expenses = expenseService.getExpensesByConditions(categoryId, expenseName, expenseDateFrom, expenseDateTo, userId, groupId);
        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("get expenses of userId %d in groupId %d successfully!", userId,groupId), expenses)
        );
    }

    @Operation(
            summary = "Restore deleted costs",
            description = "API restores a soft-deleted Expense in a group. "
    )
    @PutMapping("/{expenseId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreExpense(
             @PathVariable Long groupId,
             @PathVariable Long expenseId,
            HttpServletRequest req) {

        Long userId = (Long) req.getAttribute("userId");

        expenseService.restoreExpense(expenseId, userId, groupId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        String.format("Cost ID %d was successfully restored in group %d!", expenseId, groupId),
                        null
                )
        );
    }

    @Operation(
            summary = "get all expense deleted in group",
            description = "API to get all expense deleted in group"
    )
    @GetMapping("/expenses-deleted")
    public ResponseEntity<ApiResponse<Page<ExpenseDetailResponse>>> getAllExpenseDeleted(
            @PathVariable Long groupId,
            @RequestParam (defaultValue = "0") int page,
            @RequestParam (defaultValue = "10") int size,
            HttpServletRequest req) {

        Long userId = (Long) req.getAttribute("userId");

        Page<ExpenseDetailResponse>result=expenseService.getExpensesDeletedByGroupId(groupId, userId,page,size);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        String.format("get all expense of user id %d in group id %d", userId, groupId),
                        result
                )
        );
    }

}
