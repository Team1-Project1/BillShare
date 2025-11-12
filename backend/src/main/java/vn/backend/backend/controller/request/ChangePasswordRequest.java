package vn.backend.backend.controller.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequest {
    String password;
    String repeatPassword;
}
