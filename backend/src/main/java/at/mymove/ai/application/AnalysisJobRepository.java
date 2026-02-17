package at.mymove.ai.application;

import at.mymove.ai.domain.AnalysisJob;
import at.mymove.ai.domain.AnalysisJobStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository Interface für AnalysisJob (Domain Layer).
 */
public interface AnalysisJobRepository {

    AnalysisJob save(AnalysisJob job);

    Optional<AnalysisJob> findById(UUID id);

    List<AnalysisJob> findByVideoId(UUID videoId);

    Optional<AnalysisJob> findByOfferId(UUID offerId);

    List<AnalysisJob> findByStatus(AnalysisJobStatus status);

    void delete(AnalysisJob job);
}
