package vn.backend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.TransactionResponse;
import vn.backend.backend.service.TransactionService;
import vn.backend.backend.repository.GroupMembersRepository;

import java.util.List;



@RequestMapping("/api/groups/{groupId}/transactions")
@RestController
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final GroupMembersRepository groupMembersRepository;

    @Operation(
            summary = "Get transactions by group",
            description = "API to retrieve all transactions for a specific group. User must be a member of the group."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactionsByGroup(
            @PathVariable Long groupId,
            @RequestHeader("userId") Long userId) {

        if (!isUserInGroup(userId, groupId)) {
            return ResponseEntity.status(403)
                    .body(new ApiResponse<>("fail", "User is not a member of the group", null));
        }
        List<TransactionResponse> transactions = transactionService.getTransactionsByGroupId(groupId);
        return ResponseEntity.ok(
                new ApiResponse<>("success", "Fetched transactions by groupId", transactions)
        );
    }

    private boolean isUserInGroup(Long userId, Long groupId) {
        return groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId);
    }


}
