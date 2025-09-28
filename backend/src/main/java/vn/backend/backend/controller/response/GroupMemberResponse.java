package vn.backend.backend.controller.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Date;
@Getter
@Builder
public class GroupMemberResponse {
    private Long groupId;
    private Long userId;
    private String role;
    private Date joinedAt;
    private Boolean isActive;
}
