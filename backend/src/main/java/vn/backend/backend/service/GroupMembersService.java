package vn.backend.backend.service;

import vn.backend.backend.controller.response.GroupMemberResponse;
import vn.backend.backend.model.GroupMembersEntity;

public interface GroupMembersService {
    GroupMemberResponse confirm(Long groupId, Long userId);
    String decline(Long groupId, Long userId);
    boolean existsByGroupIdAndUserId(Long groupId, Long userId);
}
