package vn.backend.backend.controller.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

import java.io.Serializable;
@Getter
public class SignInRequest implements Serializable {
    @NotBlank(message = "email is not blank!")
    @Email(message = "email invalid")
    private String email;
    @NotBlank(message = "password is not blank!")
    private String password;
}
