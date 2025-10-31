package vn.backend.backend.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.ApiResponse;
import vn.backend.backend.controller.response.GroupDetailResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.controller.response.GroupsOfUserResponse;
import vn.backend.backend.service.EmailService;
import vn.backend.backend.service.GroupService;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/group")
@Tag(name = "group controller")
@Slf4j(topic = "group-controller" )
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;
    private final EmailService emailService;

    @Operation(summary = "create new group", description = "API to add a new group to the database")
    @PostMapping(value="/create",consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ApiResponse<GroupResponse>> register(
            @RequestPart("group") String groupJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            HttpServletRequest req) throws Exception {
        Long userId = (Long) req.getAttribute("userId");
        ObjectMapper mapper = new ObjectMapper();
        GroupCreateRequest request = mapper.readValue(groupJson, GroupCreateRequest.class);

        GroupResponse group = groupService.createGroup(request,file,userId);
        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("người dùng id : %d tạo nhóm thành công!",userId), group)
        );
    }
    @Operation(summary = "edit group", description = "API to edit a group in the database")
    @PutMapping(value = "/edit/{groupId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<ApiResponse<GroupResponse>> editGroup(
            HttpServletRequest req,
            @RequestPart("group") String groupJson,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @PathVariable Long groupId) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        GroupEditRequest request = mapper.readValue(groupJson, GroupEditRequest.class);

        GroupResponse group = groupService.editGroup(req,request, file, groupId);
        return ResponseEntity.ok(
                new ApiResponse<>("success",
                        String.format("Sửa nhóm id: %d thành công!", groupId),
                        group)
        );
    }

    @Operation(summary = "get list group by userId", description = "API to get list group by userId into the database")
    @GetMapping("/list-group")
    public ResponseEntity<ApiResponse<Page<GroupResponse>>> getListGroupByUserId(HttpServletRequest req,
                                                                    @RequestParam(defaultValue = "0") int page,
                                                                    @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) req.getAttribute("userId");
        Page<GroupResponse> groups = groupService.getAllGroupsByUserId(userId,page,size);
        return ResponseEntity.ok(
                new ApiResponse<>("success","get all group into database successfull", groups)
        );
    }
    @Operation(summary = "get detail group by group id", description = "API to get detail group by group id into the database")
    @GetMapping("/{groupId}")
    public ResponseEntity<ApiResponse<GroupDetailResponse>> getListGroupByGroupId(@PathVariable Long groupId,
                                                                                  HttpServletRequest req,
                                                                                  @RequestParam(defaultValue = "0") int page,
                                                                                  @RequestParam(defaultValue = "10") int size) {
        Long userId = (Long) req.getAttribute("userId");
        GroupDetailResponse group = groupService.getGroupDetailById(groupId,userId,page,size);
        return ResponseEntity.ok(
                new ApiResponse<>("success",String.format("get detail group %d into database successfull",groupId), group)
        );
    }
    @Operation(
            summary = "Delete group by id",
            description = "API to delete group by ID. Only allowed if user is admin and delete confirmation message if any member has cost."
    )
    @PutMapping("/{groupId}/delete")
    public ResponseEntity<ApiResponse<String>> deleteGroup(@PathVariable Long groupId, HttpServletRequest request, @RequestParam(defaultValue = "false") boolean confirmDeleteWithExpenses) {
        String result = groupService.deleteGroup(groupId,request,confirmDeleteWithExpenses);
        return ResponseEntity.ok(
                new ApiResponse<>("success",result,null)
        );
    }
    @Operation(
            summary = "Delete member from group",
            description = "API to delete members by ID. Only allowed if user is admin and delete and no member with cost can be deleted."
    )
    @PutMapping("/{groupId}/delete/{memberId}")
    public ResponseEntity<ApiResponse<String>> deleteMemberFromGroup(@PathVariable Long groupId, @PathVariable Long memberId, HttpServletRequest request) {
        String result = groupService.deleteMemberFromGroup(groupId,memberId,request);
        return ResponseEntity.ok(
                new ApiResponse<>("success",result,null)
        );
    }
    @Operation(
            summary = "user leave from group",
            description = "API to  members leave group. Only allowed if user has not expense leave group"
    )
    @PutMapping("/{groupId}/leave")
    public ResponseEntity<ApiResponse<String>> leaveGroup(@PathVariable Long groupId,HttpServletRequest request) {
        String result = groupService.leaveGroup(groupId,request);
        return ResponseEntity.ok(
                new ApiResponse<>("success",result,null)
        );
    }
    @io.swagger.v3.oas.annotations.Operation(
            summary = "Export group report to CSV",
            description = "API to export group expense file report to CSV",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "CSV file created successfully",
                            content = @io.swagger.v3.oas.annotations.media.Content(
                                    mediaType = "text/csv",
                                    schema = @io.swagger.v3.oas.annotations.media.Schema(type = "string", format = "binary")
                            )
                    ),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "500",
                            description = "Error while exporting file",
                            content = @io.swagger.v3.oas.annotations.media.Content(mediaType = "application/json")
                    )
            }
    )
    @GetMapping("/{groupId}/export")
    public void  exportGroupReport(
            @PathVariable Long groupId,
            HttpServletResponse response,
            HttpServletRequest request
    ) throws IOException {
        try {
            groupService.exportGroupReport(groupId, request, response);
        } catch (RuntimeException ex) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
            response.setContentType("application/json; charset=UTF-8");
            response.getWriter().write("{\"error\": \"" + ex.getMessage() + "\"}");
        } catch (Exception ex) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR); // 500
            response.setContentType("application/json; charset=UTF-8");
            response.getWriter().write("{\"error\": \"Lỗi hệ thống: " + ex.getMessage() + "\"}");
        }
    }
    @Operation(summary = "upload image of group", description = "API to upload image of group to cloudinary")
    @PostMapping("/{groupId}/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("userId") Long userId,
            @PathVariable Long groupId
    ) throws Exception {
        String urlImage=groupService.uploadImageGroup(file,groupId,userId);
        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("userId %d upload image of groupId %d successfully!",groupId,userId), urlImage)
        );
    }

    @Operation(summary = "set Simplify Debt mode", description = "API to Set Simplify Debts")
    @PostMapping("/{groupId}/set-simplify-debt")
    public ResponseEntity<ApiResponse<String>> setSimplifyDebt(
            @RequestParam("setSimplifyDebt") Boolean setSimplifyDebt,
            @PathVariable Long groupId,
            HttpServletRequest req
    ) throws Exception {
        Long userId = (Long) req.getAttribute("userId");
        groupService.setSimplifyDebt( groupId, userId, setSimplifyDebt);
        return ResponseEntity.ok(
                new ApiResponse<>("success", String.format("userId %d set simplify debt groupId %d successfully!",userId, groupId), null)
        );
    }
    @Operation(summary = "Send debt reminder emails", description = "API to send debt reminder emails to all debtors in a group")
    @PostMapping("/{groupId}/send-debt-reminder/{receiverId}")
    public ResponseEntity<ApiResponse<String>> sendDebtReminders(
            @PathVariable Long groupId,
            @PathVariable Long receiverId,
            HttpServletRequest req
    ) throws IOException, MessagingException {
        String resultMessage = emailService.sendDebtReminderForGroup(groupId, receiverId,req);
        return ResponseEntity.ok(
                new ApiResponse<>("success", resultMessage, null)
        );
    }
}
