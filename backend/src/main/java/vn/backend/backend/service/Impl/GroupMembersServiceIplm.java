package vn.backend.backend.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.backend.backend.controller.response.GroupMemberResponse;
import vn.backend.backend.model.GroupEntity;
import vn.backend.backend.model.GroupMembersEntity;
import vn.backend.backend.model.GroupMembersId;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.GroupMembersService;

@Service
@RequiredArgsConstructor
public class GroupMembersServiceIplm implements GroupMembersService {
    private final GroupMembersRepository groupMembersRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    @Override
    public GroupMemberResponse confirm(Long groupId, Long userId) {
        UserEntity user=userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id " + userId));
        GroupEntity group=groupRepository.findById(groupId).orElseThrow(() -> new RuntimeException("group not found with id " + groupId));
        GroupMembersEntity groupMembers=GroupMembersEntity.builder().
                id(GroupMembersId.builder().groupId(groupId).userId(userId).build()).
                group(group).
                member(user).
                build();
        groupMembersRepository.save(groupMembers);
        return GroupMemberResponse.builder().
                groupId(groupMembers.getId().getGroupId()).
                userId(groupMembers.getId().getUserId()).
                role(String.valueOf(groupMembers.getRole())).
                joinedAt(groupMembers.getJoinedAt()).
                isActive(groupMembers.getIsActive()).
                build();
    }

    @Override
    public String decline(Long groupId, Long userId) {
        UserEntity user=userRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("User not found with id " + userId));
        GroupEntity group=groupRepository.findByGroupId(groupId).orElseThrow(() -> new RuntimeException("group not found with id " + groupId));
        return String.format("người dùng %s đã từ chối lời mời vào nhóm %s!",user.getFullName(),group.getGroupName());
    }
}
