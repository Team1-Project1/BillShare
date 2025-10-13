package vn.backend.backend.controller.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class EditUserResponse {
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
}
