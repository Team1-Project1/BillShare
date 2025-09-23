package vn.backend.backend.controller.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateRequest {
    @Email(message = "Email invalid")
    @NotBlank
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
            message = "Password must contain at least 1 uppercase letter, 1 lowercase letter and 1 number"
    )
    @NotBlank
    private String password;

    @NotBlank
    private String fullNname;

    @NotBlank
    @Pattern(
            regexp = "^(0[0-9]{9})$",
            message = "phone invalid"
    )
    private String phone;
}
