package vn.backend.backend.service.Impl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.backend.common.MemberRole;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.GroupDetailResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.controller.response.UserDetailResponse;
import vn.backend.backend.model.GroupEntity;
import vn.backend.backend.model.GroupMembersEntity;
import vn.backend.backend.model.GroupMembersId;
import vn.backend.backend.model.UserEntity;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.GroupService;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupServiceIplm implements GroupService {
    private final GroupRepository groupRepository;
    private final GroupMembersRepository groupMembersRepository;
    private final UserRepository userRepository;
    @Override
    @Transactional
    public GroupResponse createGroup(GroupCreateRequest request, Long userId) {
        GroupEntity group=GroupEntity.builder().
                groupName(request.getGroupName()).
                description(request.getDescription()).
                defaultCurrency(request.getDefaultCurrency()).
                createdBy(userId).
                build();
        groupRepository.save(group);
        UserEntity user=userRepository.findByUserId(userId).orElseThrow(()->new RuntimeException("User not found"));
        groupMembersRepository.save(GroupMembersEntity.builder().
                id(GroupMembersId.builder().
                        groupId(group.getGroupId()).
                        userId(userId).
                        build()).
                role(MemberRole.admin).
                group(group).
                member(user).
                build());
        return GroupResponse.builder().
                groupId(group.getGroupId()).
                groupName(group.getGroupName()).
                description(group.getDescription()).
                createdBy(group.getCreatedBy()).
                defaultCurrency(group.getDefaultCurrency()).
                createdAt(group.getCreatedAt()).
                updatedAt(group.getUpdatedAt()).
                isActive(group.getIsActive()).
                build();
    }

    @Override
    public GroupResponse editGroup(GroupEditRequest request, Long groupId) {
        GroupEntity group=groupRepository.findByGroupId(groupId).orElseThrow(()->new RuntimeException("Group not found"));
        group.setGroupName(request.getGroupName());
        group.setDescription(request.getDescription());
        group.setDefaultCurrency(request.getDefaultCurrency());
        groupRepository.save(group);
        return GroupResponse.builder().
                groupId(group.getGroupId()).
                groupName(group.getGroupName()).
                description(group.getDescription()).
                createdBy(group.getCreatedBy()).
                defaultCurrency(group.getDefaultCurrency()).
                createdAt(group.getCreatedAt()).
                updatedAt(group.getUpdatedAt()).
                isActive(group.getIsActive()).
                build();
    }

    @Override
    public List<GroupResponse> getAllGroups() {
        List<GroupEntity>groups=groupRepository.findAll();
        List<GroupResponse>responses=new ArrayList<>();
        for(var group:groups){
            responses.add(GroupResponse.builder().
                    groupId(group.getGroupId()).
                    groupName(group.getGroupName()).
                    description(group.getDescription()).
                    createdBy(group.getCreatedBy()).
                    defaultCurrency(group.getDefaultCurrency()).
                    createdAt(group.getCreatedAt()).
                    updatedAt(group.getUpdatedAt()).
                    isActive(group.getIsActive()).
                    build());
        }
        return responses;
    }

    @Override
    public GroupDetailResponse getGroupDetailById(Long groupId) {
        GroupEntity group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with id " + groupId));
        List<UserDetailResponse>members=group.getGroupMembers().stream().map(member->{
            UserEntity user=member.getMember();
            return UserDetailResponse.builder().
                    userId(user.getUserId()).
                    email(user.getEmail()).
                    fullName(user.getFullName()).
                    phone(user.getPhone()).
                    joinAt(member.getJoinedAt()).
                    avatarUrl(user.getAvatarUrl()).
                    isActive(user.getIsActive()).
                    role(member.getRole()).
                    build();
        }).toList();
        return GroupDetailResponse.builder().
                groupId(group.getGroupId()).
                groupName(group.getGroupName()).
                description(group.getDescription()).
                createdBy(group.getCreatedBy()).
                defaultCurrency(group.getDefaultCurrency()).
                createdAt(group.getCreatedAt()).
                isActive(group.getIsActive()).
                members(members).
                build();
    }
}
