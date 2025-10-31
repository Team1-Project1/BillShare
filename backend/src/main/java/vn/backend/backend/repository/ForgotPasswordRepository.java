package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.backend.backend.model.ForgotPasswordEntity;
import vn.backend.backend.model.UserEntity;

import java.util.Optional;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPasswordEntity,Long> {
    Optional<ForgotPasswordEntity> findByUser(UserEntity user);

}
