package at.mymove.auth.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserAccountJpaRepository extends JpaRepository<UserAccountJpaEntity, UUID> {
    Optional<UserAccountJpaEntity> findByEmail(String email);
    boolean existsByEmail(String email);
}