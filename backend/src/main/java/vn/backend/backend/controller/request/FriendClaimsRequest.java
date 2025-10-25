package vn.backend.backend.controller.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FriendClaimsRequest {
    private Long senderId;
    private Long receiverId;
}
