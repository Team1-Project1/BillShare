package vn.backend.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.common.FriendshipStatus;
import vn.backend.backend.model.FriendshipEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<FriendshipEntity, Long> {
    List<FriendshipEntity> findAllByUser1UserIdOrUser2UserId(Long userId1, Long userId2);
    Optional<FriendshipEntity> findByUser1UserIdAndUser2UserId(Long userId1, Long userId2);
    List<FriendshipEntity> findAllByStatus(String status);
    FriendshipEntity findByUser1UserIdAndUser2UserIdOrUser1UserIdAndUser2UserId(Long userId1, Long userId2, Long userId3, Long userId4);
    Page<FriendshipEntity> findAllByUser1UserIdAndStatusOrUser2UserIdAndStatus(Long userId, FriendshipStatus friendshipStatus, Long userId1, FriendshipStatus friendshipStatus1, Pageable pageable);
}

