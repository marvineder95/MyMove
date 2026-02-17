package at.mymove.ai.infrastructure.persistence;

import at.mymove.ai.domain.AnalysisJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA Repository für AnalysisJobJpaEntity.
 */
@Repository
public interface AnalysisJobJpaRepository extends JpaRepository<AnalysisJobJpaEntity, UUID> {

    List<AnalysisJobJpaEntity> findByVideoId(UUID videoId);

    Optional<AnalysisJobJpaEntity> findByOfferId(UUID offerId);

    List<AnalysisJobJpaEntity> findByStatus(AnalysisJobStatus status);
}
