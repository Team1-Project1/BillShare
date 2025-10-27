package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.GroupMemberResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.model.GroupMembersEntity;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.service.GroupMembersService;

@RestController
@RequestMapping("/group-member")
@Tag(name = "group member controller")
@Slf4j(topic = "group member - controller" )
@RequiredArgsConstructor
public class GroupMembersController {
    private final GroupMembersService groupMembersService;
    @Operation(summary = "user accept invitation join group", description = "API to add a new user in group")
    @GetMapping("/{groupId}/confirm/{userId}")
    public ResponseEntity<ApiResponse<GroupMemberResponse>> confirm(@PathVariable Long groupId, @PathVariable Long userId, HttpServletRequest req) {
        Long confirmerId = (Long) req.getAttribute("userId");
        GroupMemberResponse groupMembers=groupMembersService.confirm( groupId, userId,confirmerId);
        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("người dùng id : %d đã được thêm vào nhóm id : %d!",userId,groupId), groupMembers)
        );
    }
    @Operation(summary = "user decline invitation join group", description = "API to notification user decline invitation join group")
    @GetMapping("/{groupId}/decline/{userId}")
    public ResponseEntity<ApiResponse<String>> decline(@PathVariable Long groupId, @PathVariable Long userId, HttpServletRequest req) {
        Long confirmerId = (Long) req.getAttribute("userId");
        String message=groupMembersService.decline( groupId, userId, confirmerId);
        return ResponseEntity.ok(
                new ApiResponse<>("success",message,null)
        );
    }
    @Operation(summary = "add friend to group", description = "API to add friend to group")
    @PostMapping("/{groupId}/add-friend/{userId}")
    public ResponseEntity<ApiResponse<String>> addFriendToGroup(@PathVariable Long groupId,
                                                                @PathVariable Long userId,
                                                                HttpServletRequest req) {
        Long adderId = (Long) req.getAttribute("userId");
        String message = groupMembersService.addFriendToGroup(groupId, userId,adderId);
        return ResponseEntity.ok(
                new ApiResponse<>("success", message, null)
        );
    }
}
