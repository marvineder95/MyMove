package at.mymove.company.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import at.mymove.company.domain.CompanyStatus;

public interface CompanyJpaRepository extends JpaRepository<CompanyJpaEntity, UUID> {
    boolean existsByEmail(String email);

    List<CompanyJpaEntity> findAllByStatus(CompanyStatus status);

    List<CompanyJpaEntity> findAllByStatusOrStatusIsNull(CompanyStatus status);

    long countByStatus(CompanyStatus status);
}
