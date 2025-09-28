package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.GroupEntity;

import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<GroupEntity,Long> {
    Optional<GroupEntity>findByGroupId(Long groupId);
}
