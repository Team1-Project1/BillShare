package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;
import vn.backend.backend.service.EmailService;

import java.io.IOException;

@RestController
@RequestMapping("/email")
@Tag(name = "email controller")
@Slf4j(topic = "email-controller" )
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;

    @Operation(summary = "confirm participation", description = "API to confirm participation of users in group")
    @PostMapping("/confirm-participation")
    public ResponseEntity<String> mailVerifyCation(@RequestParam Long groupId,
                                                   HttpServletRequest req,
                                                   @Valid  @RequestBody ConfirmPaticipationRequest emailTo) throws IOException {
        Long userId = (Long) req.getAttribute("userId");
        emailService.confirmParticipation(groupId, userId, emailTo);
            return ResponseEntity.ok("Email sent successfully to " + emailTo.getEmailTo());
    }

}
