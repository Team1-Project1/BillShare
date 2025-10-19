package vn.backend.backend.service.Impl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.backend.backend.common.MemberRole;
import vn.backend.backend.common.TokenType;
import vn.backend.backend.controller.request.GroupCreateRequest;
import vn.backend.backend.controller.request.GroupEditRequest;
import vn.backend.backend.controller.response.GroupDetailResponse;
import vn.backend.backend.controller.response.GroupResponse;
import vn.backend.backend.controller.response.GroupsOfUserResponse;
import vn.backend.backend.controller.response.UserDetailResponse;
import vn.backend.backend.model.*;
import vn.backend.backend.repository.*;
import vn.backend.backend.service.GroupService;
import vn.backend.backend.service.JwtService;
import vn.backend.backend.service.TransactionService;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;
import vn.backend.backend.service.UploadImageService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupServiceImpl implements GroupService {
    private final GroupRepository groupRepository;
    private final GroupMembersRepository groupMembersRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService;
    private final UploadImageService uploadImageService;
    private final ExpenseRepository expenseRepository;
    private final ExpenseParticipantRepository expenseParticipantRepository;
    private final JwtService jwtService;
    private final BalanceRepository balanceRepository;
    @Override
    @Transactional
    public GroupResponse createGroup(GroupCreateRequest request,MultipartFile file, Long userId) throws Exception {
        String urlImage=null;
        if(file != null && !file.isEmpty()){
            urlImage=uploadImageService.uploadImage(file);
        }
        GroupEntity group=GroupEntity.builder().
                groupName(request.getGroupName()).
                description(request.getDescription()).
                defaultCurrency(request.getDefaultCurrency()).
                createdBy(userId).
                avatarUrl(urlImage).
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
        //Tạo transaction cho việc tạo nhóm
        transactionService.createTransaction(
                group.getGroupId(),
                userId,
                ActionType.create,
                EntityType.group,
                group.getGroupId()
        );
        return GroupResponse.builder().
                groupId(group.getGroupId()).
                groupName(group.getGroupName()).
                description(group.getDescription()).
                createdBy(group.getCreatedBy()).
                defaultCurrency(group.getDefaultCurrency()).
                createdAt(group.getCreatedAt()).
                updatedAt(group.getUpdatedAt()).
                isActive(group.getIsActive()).
                avatarUrl(group.getAvatarUrl()).
                build();
    }

    @Override
    public GroupResponse editGroup(GroupEditRequest request,MultipartFile file, Long groupId) throws Exception {
        GroupEntity group = groupRepository.findByGroupIdAndIsActiveTrue(groupId)
                .orElseThrow(() -> new RuntimeException("Active group not found with id " + groupId));
        group.setGroupName(request.getGroupName());
        group.setDescription(request.getDescription());
        group.setDefaultCurrency(request.getDefaultCurrency());
        //Nếu người dùng không đổi ảnh, giữ nguyên avatar cũ
        if (file == null || file.isEmpty()) {
            // không làm gì cả, giữ nguyên ảnh cũ
        } else {
            //Nếu có file mới, upload và cập nhật
            String urlImage = uploadImageService.uploadImage(file);
            group.setAvatarUrl(urlImage);
        }
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
                avatarUrl(group.getAvatarUrl()).
                build();
    }

    @Override
    public GroupsOfUserResponse getAllGroupsByUserId(Long userId) {
        List<GroupMembersEntity>groupMembers=groupMembersRepository.findAllById_UserIdAndIsActiveTrue(userId);
        List<GroupResponse>responses=new ArrayList<>();
        for(var groupMember:groupMembers){
                responses.add(GroupResponse.builder().
                        groupId(groupMember.getGroup().getGroupId()).
                        groupName(groupMember.getGroup().getGroupName()).
                        description(groupMember.getGroup().getDescription()).
                        createdBy(groupMember.getGroup().getCreatedBy()).
                        defaultCurrency(groupMember.getGroup().getDefaultCurrency()).
                        createdAt(groupMember.getGroup().getCreatedAt()).
                        updatedAt(groupMember.getGroup().getUpdatedAt()).
                        isActive(groupMember.getGroup().getIsActive()).
                        avatarUrl(groupMember.getGroup().getAvatarUrl()).
                        build());
        }
        return GroupsOfUserResponse.builder()
                .groups(responses)
                .totalGroups(responses.size())
                .build();
    }

    @Override
    public GroupDetailResponse getGroupDetailById(Long groupId) {
        GroupEntity group = groupRepository.findByGroupIdAndIsActiveTrue(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with id " + groupId));
        List<UserDetailResponse>members=new ArrayList<>();
        List<GroupMembersEntity>groupMembers=groupMembersRepository.findAllById_GroupIdAndIsActiveTrue(groupId);
        for(var groupMember:groupMembers ){
            members.add(UserDetailResponse.builder()
                            .userId(groupMember.getMember().getUserId())
                            .email(groupMember.getMember().getEmail())
                            .fullName(groupMember.getMember().getFullName())
                            .phone(groupMember.getMember().getPhone())
                            .joinAt(groupMember.getJoinedAt())
                            .avatarUrl(groupMember.getMember().getAvatarUrl())
                            .role(groupMember.getRole())
                    .build());
        }
        return GroupDetailResponse.builder()
                .groupId(group.getGroupId())
                .groupName(group.getGroupName())
                .description(group.getDescription())
                .createdBy(group.getCreatedBy())
                .defaultCurrency(group.getDefaultCurrency())
                .createdAt(group.getCreatedAt())
                .isActive(group.getIsActive())
                .avatar(group.getAvatarUrl())
                .members(members)
                .totalMembers(members.size())
                .build();
    }
    @Transactional
    @Override
    public String deleteGroup(Long groupId, HttpServletRequest request, boolean confirmDeleteWithExpenses) {
        String token= request.getHeader("Authorization").substring("Bearer ".length());
        Long userId=jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        GroupEntity group=groupRepository.findByGroupIdAndIsActiveTrue(groupId).orElseThrow(()->new RuntimeException("Group not found with id " + groupId));
        Optional<GroupMembersEntity> group_member=groupMembersRepository.findById(GroupMembersId.builder().userId(userId).groupId(groupId).build());
        if(group_member.isEmpty() ){
            throw new RuntimeException("User is not member of group");
        }
        if( group_member.get().getRole()!= MemberRole.admin){
            throw new RuntimeException("User is not admin of group");
        }
        //TODO: kiểm tra người dùng trong nhóm có khoản chi nào không, nếu có thì phải thông báo trưcớc khi xóa
        List<ExpenseEntity> hasExpenses = expenseRepository.findAllByGroupGroupId(groupId);
        if (!hasExpenses.isEmpty() && !confirmDeleteWithExpenses) {
            throw new RuntimeException("Group id "+groupId+" has "+hasExpenses.size()+" expenses, confirmation required before deletion");
        }
        balanceRepository.deleteByGroup_GroupId(groupId);
        expenseRepository.deleteByGroup_GroupId(groupId);
        group.setIsActive(false);
        groupRepository.save(group);
        List<GroupMembersEntity> members = groupMembersRepository.findAllById_GroupId(groupId);
        for (GroupMembersEntity member : members) {
            member.setIsActive(false);
        }
        groupMembersRepository.saveAll(members);
        return String.format("Delete group id %d successfully",groupId);
    }
    @Transactional
    @Override
    public String deleteMemberFromGroup(Long groupId, Long memberId, HttpServletRequest request) {
        String token= request.getHeader("Authorization").substring("Bearer ".length());
        Long id=jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        Optional<GroupMembersEntity> group_member=groupMembersRepository.findById(GroupMembersId.builder().userId(id).groupId(groupId).build());
        if(group_member.isEmpty()){
            throw new RuntimeException("User is not member of group");
        }
        if(group_member.get().getRole()!= MemberRole.admin){
            throw new RuntimeException("User is not admin of group");
        }
        GroupMembersEntity memberToDelete = groupMembersRepository.findById(
                GroupMembersId.builder()
                        .userId(memberId)
                        .groupId(groupId)
                        .build()
        ).orElseThrow(() -> new RuntimeException("Member with id " + memberId + " not found in group " + groupId));
        if(id.equals(memberId)){
            throw new RuntimeException("Admin cannot delete themselves from the group");
        }
        // TODO: Kiểm tra thành viên có khoản chi trong group không nếu có thì không được xóa
        List<ExpenseParticipantEntity> hasExpenses =expenseParticipantRepository.findAllByExpense_Group_GroupIdAndUser_UserId(groupId, memberId);

        if (!hasExpenses.isEmpty()) {
            throw new RuntimeException("Cannot remove member id " +memberId+ " because they have "+hasExpenses.size() +" related expenses in the group");
        }
        balanceRepository.deleteByGroup_GroupIdAndUser1_UserIdOrGroup_GroupIdAndUser2_UserId(groupId, memberId, groupId, memberId);
        memberToDelete.setIsActive(false);
        groupMembersRepository.save(memberToDelete);
        return String.format("Delete member id %d from group id %d successfully", memberId, groupId);
    }
    @Transactional
    @Override
    public String leaveGroup(Long groupId, HttpServletRequest request) {
        String token= request.getHeader("Authorization").substring("Bearer ".length());
        Long userId=jwtService.extractUserId(token, TokenType.ACCESS_TOKEN);
        GroupEntity group=groupRepository.findByGroupIdAndIsActiveTrue(groupId).orElseThrow(()->new RuntimeException("Group not found with id " + groupId));
        GroupMembersEntity groupMember=groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId,userId);
        if(groupMember==null){
            throw new RuntimeException("User is not member of group");
        }
        if(groupMember.getRole()==MemberRole.admin){
            throw new RuntimeException("Admin cannot leave the group. Please assign another admin before leaving.");
        }
        List<ExpenseParticipantEntity> hasExpenses =expenseParticipantRepository.findAllByExpense_Group_GroupIdAndUser_UserId(groupId, userId);
        if (!hasExpenses.isEmpty()) {
            throw new RuntimeException("user id "+userId+" cannot leave group because you have "+hasExpenses.size() +" related expenses in the group");
        }
        balanceRepository.deleteByGroup_GroupIdAndUser1_UserIdOrGroup_GroupIdAndUser2_UserId(groupId, userId, groupId, userId);
        groupMember.setIsActive(false);
        groupMembersRepository.save(groupMember);
        return String.format("User id %d leave group id %d successfully",userId,groupId);
    }
    @Override
    public String uploadImageGroup(MultipartFile file, Long groupId, Long userId) throws Exception {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id " + userId));
        GroupEntity group = groupRepository.findByGroupIdAndIsActiveTrue(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found with id " + groupId));
        GroupMembersEntity groupMember=groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId,userId);
        if(groupMember==null){
            throw new RuntimeException("User is not member of group");
        }
        String urlImage=uploadImageService.uploadImage(file);
        group.setAvatarUrl(urlImage);
        groupRepository.save(group);
        return urlImage;
    }
}
