// java
package vn.backend.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.response.BalanceResponse;
import vn.backend.backend.service.BalanceService;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class BalanceController {
    private final BalanceService balanceService;

    @GetMapping("/{groupId}/users/{userId}/balances")
    public ResponseEntity<BalanceResponse> getUserBalances(
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        BalanceResponse response = balanceService.getUserBalanceResponse(groupId, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{groupId}/users/{userId}/balances/simplified")
    public ResponseEntity<BalanceResponse> getSimplifiedUserBalances(
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        BalanceResponse response = balanceService.getSimplifiedUserBalanceResponse(groupId, userId);
        return ResponseEntity.ok(response);
    }
}
