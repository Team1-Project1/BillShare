package vn.backend.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.GroupDetailResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.controller.response.GroupsOfUserResponse;

import java.io.IOException;
import java.util.List;

public interface GroupService {
    GroupResponse createGroup(GroupCreateRequest request,MultipartFile file, Long userId) throws Exception;
    GroupResponse editGroup(HttpServletRequest req,GroupEditRequest request, MultipartFile file, Long groupId) throws Exception;
    GroupsOfUserResponse getAllGroupsByUserId(Long userId);
    GroupDetailResponse getGroupDetailById(Long groupId);
    String deleteGroup(Long groupId, HttpServletRequest request, boolean confirmDeleteWithExpenses);
    String deleteMemberFromGroup(Long groupId, Long memberId, HttpServletRequest request);
    String uploadImageGroup(MultipartFile file,Long groupId, Long userId) throws Exception;
    String leaveGroup(Long groupId, HttpServletRequest request);
    void exportGroupReport(Long groupId,HttpServletRequest request, HttpServletResponse response) throws IOException;
    void setSimplifyDebt(Long groupId,Long userId, boolean isSimplifyDebt);
}
