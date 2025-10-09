package vn.backend.backend.controller.request;

import lombok.*;
import vn.backend.backend.common.SplitMethod;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExpenseRequest {
    private String expenseName;
    private BigDecimal totalAmount;
    private String currency;
    private Long categoryId;
    private Date expenseDate;
    private String description;
    private Long payerId;
    private SplitMethod splitMethod;
    private List<ParticipantShareRequest> participants;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantShareRequest {
        private Long userId;
        private BigDecimal shareAmount;
    }
}
