package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.UserEntity;
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
}
