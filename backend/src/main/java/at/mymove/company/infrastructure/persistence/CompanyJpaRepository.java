package at.mymove.company.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CompanyJpaRepository extends JpaRepository<CompanyJpaEntity, UUID> {
    boolean existsByEmail(String email);
}