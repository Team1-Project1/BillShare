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
import vn.backend.backend.service.TransactionService;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupMembersServiceImpl implements GroupMembersService {
    private final GroupMembersRepository groupMembersRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final TransactionService transactionService;

    @Override
    public GroupMemberResponse confirm(Long groupId, Long userId) {
        UserEntity user=userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id " + userId));
        GroupEntity group=groupRepository.findByGroupIdAndIsActiveTrue(groupId).orElseThrow(() -> new RuntimeException("group not found with id " + groupId));
        if(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveFalse(groupId,userId)){
            Optional<GroupMembersEntity> existingMember=groupMembersRepository.findById_GroupIdAndId_UserId(groupId,userId);
            existingMember.get().setIsActive(true);
            groupMembersRepository.save(existingMember.get());
            return GroupMemberResponse.builder().
                    groupId(existingMember.get().getId().getGroupId()).
                    userId(existingMember.get().getId().getUserId()).
                    role(String.valueOf(existingMember.get().getRole())).
                    joinedAt(existingMember.get().getJoinedAt()).
                    isActive(existingMember.get().getIsActive()).
                    build();

        }
        GroupMembersEntity groupMembers=GroupMembersEntity.builder().
                id(GroupMembersId.builder().groupId(groupId).userId(userId).build()).
                group(group).
                member(user).
                build();
        groupMembersRepository.save(groupMembers);
        //Tạo transaction cho việc thành viên vào nhóm
        transactionService.createTransaction(
                groupId,
                userId,
                ActionType.join,
                EntityType.group,
                groupId
        );
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
