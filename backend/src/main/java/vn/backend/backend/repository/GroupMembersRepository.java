package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.GroupMembersEntity;
import vn.backend.backend.model.GroupMembersId;
@Repository
public interface GroupMembersRepository extends JpaRepository<GroupMembersEntity, GroupMembersId> {

}
