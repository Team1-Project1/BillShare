package vn.backend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.TransactionResponse;
import vn.backend.backend.service.TransactionService;
import vn.backend.backend.repository.GroupMembersRepository;

import java.util.List;



@RequestMapping("/api/transactions")
@RestController
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final GroupMembersRepository groupMembersRepository;

    @Operation(
            summary = "Get transactions by group",
            description = "API to retrieve all transactions for a specific group, with pagination. User must be a member of the group." // <-- Cập nhật mô tả
    )
    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactionsByGroup(
            HttpServletRequest request,
            @PageableDefault(
                    size = 20,
                    sort = "timestamp",
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        // 3. Gọi service với pageable
        Long userId = (Long) request.getAttribute("userId");
        Page<TransactionResponse> transactionsPage = transactionService.getTransactionsByGroupId(userId, pageable);

        return ResponseEntity.ok(
                // 4. Trả về đối tượng Page
                new ApiResponse<>("success", "Fetched transactions by groupId", transactionsPage)
        );
    }
}
