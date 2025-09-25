package vn.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.backend.backend.model.TokenEntity;
import vn.backend.backend.model.UserEntity;

import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<TokenEntity, Long> {
    Optional<TokenEntity> findByEmail(String email);

}
