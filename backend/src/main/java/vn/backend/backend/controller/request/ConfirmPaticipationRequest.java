package vn.backend.backend.controller.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;

@Getter
public class ConfirmPaticipationRequest {
    @Email(message = "Email invalid")
    private String emailTo;
}
