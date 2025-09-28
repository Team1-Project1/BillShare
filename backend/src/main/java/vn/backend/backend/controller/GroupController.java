package vn.backend.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.request.UserCreateRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.GroupDetailResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.service.GroupService;

import java.util.List;

@RestController
@RequestMapping("/group")
@Tag(name = "group controller")
@Slf4j(topic = "group-controller" )
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @Operation(summary = "create new group", description = "API to add a new group to the database")
    @PostMapping("/create/{userId}")
    public ResponseEntity<ApiResponse<GroupResponse>> register(@RequestBody GroupCreateRequest request, @PathVariable Long userId) {
        GroupResponse group = groupService.createGroup(request,userId);
        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("người dùng id : %d tạo nhóm thành công!",userId), group)
        );
    }
    @Operation(summary = "edit group", description = "API to edit a group in the database")
    @PutMapping("/edit/{groupId}")
    public ResponseEntity<ApiResponse<GroupResponse>> editGroup(@RequestBody GroupEditRequest request, @PathVariable Long groupId) {
        GroupResponse group = groupService.editGroup(request,groupId);
        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("sửa nhóm id : %d thành công!",groupId), group)
        );
    }
    @Operation(summary = "get list group", description = "API to get list group into the database")
    @GetMapping("/list-group")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getListGroup() {
        List<GroupResponse> groups = groupService.getAllGroups();
        return ResponseEntity.ok(
                new ApiResponse<>("success","get all group into database successfull", groups)
        );
    }
    @Operation(summary = "get detail group by group id", description = "API to get detail group by group id into the database")
    @GetMapping("/{groupId}")
    public ResponseEntity<ApiResponse<GroupDetailResponse>> getListGroup(@PathVariable Long groupId) {
        GroupDetailResponse group = groupService.getGroupDetailById(groupId);
        return ResponseEntity.ok(
                new ApiResponse<>("success",String.format("get detail group %d into database successfull",groupId), group)
        );
    }
}
