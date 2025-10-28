package vn.backend.backend.controller.response;

import lombok.Builder;
import lombok.Data;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;

import java.util.Date;

@Data
@Builder
public class TransactionResponse {
    private Long transactionId;
    private Long groupId;
    private String groupName;
    private Long userId;
    private String userName;
    private ActionType actionType;
    private EntityType entityType;
    private Long entityId;
    private Date timestamp;
}
