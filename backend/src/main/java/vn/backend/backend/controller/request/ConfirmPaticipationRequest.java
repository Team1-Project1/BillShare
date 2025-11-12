package vn.backend.backend.controller.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConfirmPaticipationRequest {
    @Email(message = "Email invalid")
    private String emailTo;
}
