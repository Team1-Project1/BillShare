package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.service.UserService;

@RestController
@RequestMapping("/users")
@Tag(name = "user controller")
@Slf4j(topic = "user-controller" )
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
}
