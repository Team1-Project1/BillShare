package vn.backend.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.controller.request.EditUserRequest;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.EditUserResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.service.TokenService;
import vn.backend.backend.service.UserService;

@RestController
@RequestMapping("/users")
@Tag(name = "user controller")
@Slf4j(topic = "user-controller" )
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @Operation(summary = "get user", description = "API to get information a user to the database")
    @GetMapping(value = "")
    public ResponseEntity<ApiResponse<EditUserResponse>> getUser(
            HttpServletRequest request){

        EditUserResponse user = userService.getUser(request);
        return ResponseEntity.ok(
                new ApiResponse<>("success",
                        String.format("get user  id: %d successfully!", user.getId()),user)
        );
    }

    @Operation(summary = "edit user", description = "API to edit a user in the database")
    @PatchMapping(value = "/edit", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ApiResponse<EditUserResponse>> editGroup(
            @RequestPart("user") String userJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            HttpServletRequest request) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        EditUserRequest userRequest = mapper.readValue(userJson, EditUserRequest.class);

        EditUserResponse user = userService.editUser(userRequest, file,request);
        return ResponseEntity.ok(
                new ApiResponse<>("success",
                        String.format("update user  id: %d successfully!", user.getId()),
                        user)
        );
    }
}
