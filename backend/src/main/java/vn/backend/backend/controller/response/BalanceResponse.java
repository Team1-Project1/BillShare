package vn.backend.backend.controller.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceResponse {
    private Long userId; // ID of the user who called the API
    private String userName; // Name of the user who called the API
    private Long groupId;
    private String groupName;
    private List<UserBalanceDetail> balances; // List of balances with other users

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserBalanceDetail {
        private Long userId; // ID of the other user
        private String userName; // Name of the other user
        private BigDecimal amount; // Amount of the balance
        private boolean isOwed;// true if the calling user is owed money by this user, false if they owe
    }
}
