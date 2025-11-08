package vn.backend.backend.controller.response;

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
public class ExpenseDetailResponse {
    private Long expenseId;
    private Long groupId;
    private String groupName;
    private String expenseName;
    private BigDecimal totalAmount;
    private String currency;
    private Long categoryId;
    private String categoryName;
    private Date expenseDate;
    private String description;
    private Long createdByUserId;
    private String createdByUserName;
    private Long payerUserId;
    private String payerUserName;
    private SplitMethod splitMethod;
    private Date createdAt;
    private Date updatedAt;
    private List<ExpenseParticipantResponse> participants;
    private int totalParticipants;
    private Date deletedAt;
}
