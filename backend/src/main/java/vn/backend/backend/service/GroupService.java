package vn.backend.backend.service;

import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.GroupDetailResponse;
import vn.backend.backend.controller.response.GroupResponse;

import java.util.List;

public interface GroupService {
    GroupResponse createGroup(GroupCreateRequest request, Long userId);
    GroupResponse editGroup(GroupEditRequest request, Long groupId);
    List<GroupResponse> getAllGroups();
    GroupDetailResponse getGroupDetailById(Long groupId);

}
