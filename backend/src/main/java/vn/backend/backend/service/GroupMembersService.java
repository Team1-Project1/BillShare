package vn.backend.backend.service;

import vn.backend.backend.controller.response.GroupMemberResponse;
import vn.backend.backend.model.GroupMembersEntity;

public interface GroupMembersService {
    GroupMemberResponse confirm(Long groupId, Long userId,Long confirmerId);
    String decline(Long groupId, Long userId,Long confirmerId);
    String addFriendToGroup(Long groupId, Long userId,Long adderId);
}
