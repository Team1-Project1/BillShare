package vn.backend.backend.controller.request;

import lombok.Getter;

@Getter
public class ChangePasswordRequest {
    String password;
    String repeatPassword;
}
