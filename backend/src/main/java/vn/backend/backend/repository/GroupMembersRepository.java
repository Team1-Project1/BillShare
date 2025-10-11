package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.GroupMembersEntity;
import vn.backend.backend.model.GroupMembersId;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMembersRepository extends JpaRepository<GroupMembersEntity, GroupMembersId> {
    List<GroupMembersEntity> findAllById_GroupId(Long groupId);
    Optional<GroupMembersEntity> findById_GroupIdAndId_UserId(Long groupId, Long userId);
    GroupMembersEntity findById_GroupIdAndId_UserIdAndIsActiveTrue(Long groupId, Long userId);
    Boolean existsById_GroupIdAndId_UserIdAndIsActiveTrue(Long groupId, Long userId);
    Boolean existsById_GroupIdAndId_UserIdAndIsActiveFalse(Long groupId, Long userId);
    List<GroupMembersEntity> findAllById_UserIdAndIsActiveTrue(Long userId);
    List<GroupMembersEntity> findAllById_GroupIdAndIsActiveTrue(Long groupId);
}
