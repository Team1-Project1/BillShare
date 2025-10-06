package vn.backend.backend.controller.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseParticipantResponse {
    private Long participantId;
    private Long expenseId;
    private String expenseName;
    private Long userId;
    private String userName;
    private String userEmail;
    private BigDecimal shareAmount;
    private String currency;
    private Date createdAt;
    private Date updatedAt;
}
