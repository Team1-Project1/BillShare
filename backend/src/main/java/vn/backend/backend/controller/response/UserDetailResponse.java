package vn.backend.backend.controller.response;

import lombok.*;
import vn.backend.backend.common.MemberRole;

import java.io.Serializable;
import java.util.Date;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class UserDetailResponse implements Serializable {
    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private Date joinAt;
    private String avatarUrl;
    private MemberRole role;
}
