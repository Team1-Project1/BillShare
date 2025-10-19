package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.BalanceEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface BalanceRepository extends JpaRepository<BalanceEntity, Long> {
    List<BalanceEntity> findAllByGroupGroupId(Long groupId);
    Optional<BalanceEntity> findByGroupGroupIdAndUser1UserIdAndUser2UserId(Long groupId, Long userId1, Long userId2);
    void deleteByGroup_GroupIdAndUser1_UserIdOrGroup_GroupIdAndUser2_UserId(Long groupId1, Long userId1, Long groupId2, Long userId2);
    void deleteByGroup_GroupId(Long groupId);
}
