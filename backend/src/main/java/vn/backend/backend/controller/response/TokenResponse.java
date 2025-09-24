package vn.backend.backend.controller.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenResponse {
    private String accesstToken;
    private String refreshtToken;
    private Long userId;
}
