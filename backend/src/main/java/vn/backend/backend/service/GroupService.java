package vn.backend.backend.service;

import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.GroupDetailResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.controller.response.GroupsOfUserResponse;

import java.util.List;

public interface GroupService {
    GroupResponse createGroup(GroupCreateRequest request,MultipartFile file, Long userId) throws Exception;
    GroupResponse editGroup(GroupEditRequest request, MultipartFile file, Long groupId) throws Exception;
    GroupsOfUserResponse getAllGroupsByUserId(Long userId);
    GroupDetailResponse getGroupDetailById(Long groupId);
    String deleteGroup(Long groupId,Long userId);
    String deleteMemberFromGroup(Long groupId,Long userId,Long memberId);
    String uploadImageGroup(MultipartFile file,Long groupId, Long userId) throws Exception;
}
