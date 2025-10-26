package vn.backend.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.controller.request.ConfirmPaticipationRequest;
import vn.backend.backend.controller.request.EditUserRequest;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.EditUserResponse;
import vn.backend.backend.controller.response.FriendResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.service.EmailService;
import vn.backend.backend.service.TokenService;
import vn.backend.backend.service.UserService;

import java.io.IOException;

@RestController
@RequestMapping("/users")
@Tag(name = "user controller")
@Slf4j(topic = "user-controller" )
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final EmailService emailService;

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
    @Operation(summary = "Send email friend request", description = "API to send email friend request")
    @PostMapping("/send-friend-request")
    public ResponseEntity<ApiResponse<String>> sendFriendRequest(
            HttpServletRequest req,
            @RequestParam String email) throws IOException {
        String friendToken=emailService.sendFriendRequest(email,req);
        return ResponseEntity.ok(
                new ApiResponse<>("success",String.format("sent email to %s successfully",email),friendToken)
        );
    }
    @Operation(summary = "delete friend ship of user", description = "API to delete friend ship of user")
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<ApiResponse<String>> decline(HttpServletRequest req, @PathVariable Long userId) {
        String message=userService.deleteFriendship(req,userId);
        return ResponseEntity.ok(
                new ApiResponse<>("success",message,null)
        );
    }
    @Operation(summary = "get list friend of user", description = "API to get list friend of user")
    @GetMapping("/friends")
    public ResponseEntity<ApiResponse<Page<FriendResponse>>> getFriends(HttpServletRequest req,
                                                                     @RequestParam(defaultValue = "0") int page,
                                                                     @RequestParam(defaultValue = "10") int size,
                                                                     @RequestParam(defaultValue = "desc") String sortDirection) {
        Page<FriendResponse> data=userService.getFriends(req, page, size, sortDirection);
        return ResponseEntity.ok(
                new ApiResponse<>("success","get list friend successfully",data)
        );
    }
}
