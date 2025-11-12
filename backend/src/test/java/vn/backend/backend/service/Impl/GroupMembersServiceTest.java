package vn.backend.backend.service.Impl;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.backend.backend.common.MemberRole;
import vn.backend.backend.controller.response.GroupMemberResponse;
import vn.backend.backend.model.*;
import vn.backend.backend.repository.FriendshipRepository;
import vn.backend.backend.repository.GroupMembersRepository;
import vn.backend.backend.repository.GroupRepository;
import vn.backend.backend.repository.UserRepository;
import vn.backend.backend.service.TransactionService;
import vn.backend.backend.common.ActionType;
import vn.backend.backend.common.EntityType;

import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupMembersServiceTest {

    @Mock private GroupMembersRepository groupMembersRepository;
    @Mock private UserRepository userRepository;
    @Mock private GroupRepository groupRepository;
    @Mock private FriendshipRepository friendshipRepository;
    @Mock private TransactionService transactionService;

    @InjectMocks
    private GroupMembersServiceImpl groupMembersService;

    private UserEntity user;
    private GroupEntity group;
    private GroupMembersEntity groupMember;

    private final Long groupId = 1L;
    private final Long userId = 100L;
    private final Long confirmerId = 100L; // cùng userId
    private final Long adderId = 200L;
    private final String fullName = "Nguyen Van A";
    private final String groupName = "Family Group";

    @BeforeEach
    void setUp() {
        user = UserEntity.builder()
                .userId(userId)
                .fullName(fullName)
                .email("user@test.com")
                .build();

        group = GroupEntity.builder()
                .groupId(groupId)
                .groupName(groupName)
                .isActive(true)
                .build();

        groupMember = GroupMembersEntity.builder()
                .id(GroupMembersId.builder().groupId(groupId).userId(userId).build())
                .group(group)
                .member(user)
                .role(MemberRole.member)
                .isActive(true)
                .joinedAt(new Date())
                .build();
    }

    @Test
    @DisplayName("confirm - Không được confirm hộ người khác")
    void confirm_notAllowedForOthers() {
        assertThatThrownBy(() -> groupMembersService.confirm(groupId, userId, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You are not allowed to confirm for other users");
    }

    @Test
    @DisplayName("confirm - Đã là thành viên rồi")
    void confirm_alreadyMember() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId))
                .thenReturn(groupMember);

        assertThatThrownBy(() -> groupMembersService.confirm(groupId, userId, confirmerId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User id " + userId + " is already a member of group id " + groupId);
    }

    @Test
    @DisplayName("confirm - Có lời mời cũ (isActive=false) → kích hoạt lại")
    void confirm_reactivateOldInvitation() {
        GroupMembersEntity inactiveMember = GroupMembersEntity.builder()
                .id(GroupMembersId.builder().groupId(groupId).userId(userId).build())
                .group(group)
                .member(user)
                .isActive(false)
                .role(MemberRole.member)
                .joinedAt(new Date())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId))
                .thenReturn(null);
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveFalse(groupId, userId))
                .thenReturn(true);
        when(groupMembersRepository.findById_GroupIdAndId_UserId(groupId, userId))
                .thenReturn(Optional.of(inactiveMember));
        when(groupMembersRepository.save(any(GroupMembersEntity.class))).thenReturn(inactiveMember);

        GroupMemberResponse response = groupMembersService.confirm(groupId, userId, confirmerId);

        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getGroupId()).isEqualTo(groupId);
        assertThat(response.getIsActive()).isTrue();
        verify(groupMembersRepository).save(argThat(m -> m.getIsActive()));
        verify(transactionService, never()).createTransaction(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("confirm - Tạo mới thành viên + transaction")
    void confirm_createNewMember() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId))
                .thenReturn(null);
        when(groupMembersRepository.existsById_GroupIdAndId_UserIdAndIsActiveFalse(groupId, userId))
                .thenReturn(false);
        when(groupMembersRepository.save(any(GroupMembersEntity.class))).thenAnswer(i -> i.getArgument(0));

        GroupMemberResponse response = groupMembersService.confirm(groupId, userId, confirmerId);

        assertThat(response.getUserId()).isEqualTo(userId);
        assertThat(response.getGroupId()).isEqualTo(groupId);
        assertThat(response.getRole()).isEqualTo("member");
        assertThat(response.getIsActive()).isTrue();

        verify(groupMembersRepository).save(argThat(m ->
                m.getId().getGroupId().equals(groupId) &&
                        m.getId().getUserId().equals(userId) &&
                        m.getGroup().equals(group) &&
                        m.getMember().equals(user)
        ));
        verify(transactionService).createTransaction(
                groupId, userId, ActionType.join, EntityType.group, groupId
        );
    }

    @Test
    @DisplayName("decline - Từ chối lời mời thành công")
    void decline_success() {
        when(userRepository.findByUserId(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupId(groupId)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId))
                .thenReturn(null);

        String result = groupMembersService.decline(groupId, userId, confirmerId);

        assertThat(result).isEqualTo(
                String.format("người dùng %s đã từ chối lời mời vào nhóm %s!", fullName, groupName)
        );
    }
    @Test
    @DisplayName("decline - Không được từ chối hộ người khác")
    void decline_notAllowedForOthers() {
        assertThatThrownBy(() -> groupMembersService.decline(groupId, userId, 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You are not allowed to decline for other users");
    }

    @Test
    @DisplayName("decline - User không tồn tại")
    void decline_userNotFound() {
        when(userRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupMembersService.decline(groupId, userId, confirmerId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found with id " + userId);
    }

    @Test
    @DisplayName("decline - Group không tồn tại")
    void decline_groupNotFound() {
        when(userRepository.findByUserId(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupId(groupId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupMembersService.decline(groupId, userId, confirmerId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("group not found with id " + groupId);
    }
    @Test
    @DisplayName("addFriendToGroup - Người thêm không phải thành viên nhóm")
    void addFriendToGroup_adderNotInGroup() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, adderId))
                .thenReturn(null);

        assertThatThrownBy(() -> groupMembersService.addFriendToGroup(groupId, userId, adderId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You are not a member of group id " + groupId);
    }

    @Test
    @DisplayName("addFriendToGroup - Không phải bạn bè")
    void addFriendToGroup_notFriends() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, adderId))
                .thenReturn(groupMember);
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                adderId, userId, userId, adderId))
                .thenReturn(null);

        assertThatThrownBy(() -> groupMembersService.addFriendToGroup(groupId, userId, adderId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("You are not friends with user id " + userId);
    }

    @Test
    @DisplayName("addFriendToGroup - Thành công thêm bạn vào nhóm")
    void addFriendToGroup_success() {
        FriendshipEntity friendship = new FriendshipEntity();
        GroupMembersEntity adderMember = GroupMembersEntity.builder()
                .id(GroupMembersId.builder().groupId(groupId).userId(adderId).build())
                .isActive(true)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.of(group));
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, adderId))
                .thenReturn(adderMember);
        when(friendshipRepository.findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(
                adderId, userId, userId, adderId))
                .thenReturn(friendship);
        when(groupMembersRepository.findById_GroupIdAndId_UserIdAndIsActiveTrue(groupId, userId))
                .thenReturn(null);
        when(groupMembersRepository.save(any(GroupMembersEntity.class))).thenAnswer(i -> i.getArgument(0));

        String result = groupMembersService.addFriendToGroup(groupId, userId, adderId);

        assertThat(result).isEqualTo(
                String.format("add friend %s to group %s successfully!", fullName, groupName)
        );

        verify(groupMembersRepository).save(argThat(m ->
                m.getId().getUserId().equals(userId) &&
                        m.getMember().equals(user)
        ));
        verify(transactionService).createTransaction(
                groupId, userId, ActionType.join, EntityType.group, groupId
        );
    }
    @Test
    @DisplayName("addFriendToGroup - User không tồn tại")
    void addFriendToGroup_userNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupMembersService.addFriendToGroup(groupId, userId, adderId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("User not found with id " + userId);
    }

    @Test
    @DisplayName("addFriendToGroup - Group không tồn tại hoặc không active")
    void addFriendToGroup_groupNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(groupRepository.findByGroupIdAndIsActiveTrue(groupId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupMembersService.addFriendToGroup(groupId, userId, adderId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("group not found with id " + groupId);
    }
}