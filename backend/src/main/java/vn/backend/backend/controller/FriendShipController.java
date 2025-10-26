package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.GroupMemberResponse;
import vn.backend.backend.repository.FriendshipRepository;
import vn.backend.backend.service.FriendShipService;
import vn.backend.backend.service.GroupMembersService;

@RestController
@RequestMapping("/friendship")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Tag(name = "friendship controller")
@Slf4j(topic = "friendship - controller" )
@RequiredArgsConstructor
public class FriendShipController {
    private final FriendShipService friendShipService;

    private static final String FRONTEND_BASE_URL = "http://localhost:3000";

    @Operation(summary = "user accept friend request", description = "API to accept friend request")
    @GetMapping("/accept/{token}")
    public ResponseEntity<ApiResponse<String>> confirm(@PathVariable String token, HttpServletRequest request) {

        String message=friendShipService.acceptFriendRequest(request,token);
        return ResponseEntity.ok(
                new ApiResponse<>("success", message, null)
        );
    }
    @Operation(summary = "user decline friend request", description = "API to decline friend request")
    @GetMapping("/decline/{token}")
    public ResponseEntity<ApiResponse<String>> decline(@PathVariable String token, HttpServletRequest request) {
        String message=friendShipService.declineFriendRequest(request,token);
        return ResponseEntity.ok(
                new ApiResponse<>("success",message,null)
        );
    }
}