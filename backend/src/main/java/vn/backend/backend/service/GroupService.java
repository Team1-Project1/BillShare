package vn.backend.backend.service;

import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.GroupDetailResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.controller.response.GroupsOfUserResponse;

import java.util.List;

public interface GroupService {
    
    GroupResponse createGroup(GroupCreateRequest request, Long userId);
    GroupResponse editGroup(GroupEditRequest request, Long groupId);
    GroupsOfUserResponse getAllGroupsByUserId(Long userId);
    GroupDetailResponse getGroupDetailById(Long groupId);
    String deleteGroup(Long groupId,Long userId);
    String deleteMemberFromGroup(Long groupId,Long userId,Long memberId);
}
