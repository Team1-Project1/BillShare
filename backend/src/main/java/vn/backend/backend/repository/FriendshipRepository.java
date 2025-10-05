package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.FriendshipEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<FriendshipEntity, Long> {
    List<FriendshipEntity> findAllByUser1UserIdOrUser2UserId(Long userId1, Long userId2);
    Optional<FriendshipEntity> findByUser1UserIdAndUser2UserId(Long userId1, Long userId2);
    List<FriendshipEntity> findAllByStatus(String status);
}

