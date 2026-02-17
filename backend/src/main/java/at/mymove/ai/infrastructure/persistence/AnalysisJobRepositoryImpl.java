package at.mymove.ai.infrastructure.persistence;

import at.mymove.ai.application.AnalysisJobRepository;
import at.mymove.ai.domain.AnalysisJob;
import at.mymove.ai.domain.AnalysisJobStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementierung des AnalysisJobRepository Interface.
 */
@Repository
@RequiredArgsConstructor
public class AnalysisJobRepositoryImpl implements AnalysisJobRepository {

    private final AnalysisJobJpaRepository jpaRepository;
    private final AnalysisJobMapper mapper;

    @Override
    public AnalysisJob save(AnalysisJob job) {
        AnalysisJobJpaEntity entity = mapper.toJpaEntity(job);
        AnalysisJobJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomainEntity(saved);
    }

    @Override
    public Optional<AnalysisJob> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomainEntity);
    }

    @Override
    public List<AnalysisJob> findByVideoId(UUID videoId) {
        return jpaRepository.findByVideoId(videoId).stream()
                .map(mapper::toDomainEntity)
                .toList();
    }

    @Override
    public Optional<AnalysisJob> findByOfferId(UUID offerId) {
        return jpaRepository.findByOfferId(offerId).map(mapper::toDomainEntity);
    }

    @Override
    public List<AnalysisJob> findByStatus(AnalysisJobStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(mapper::toDomainEntity)
                .toList();
    }

    @Override
    public void delete(AnalysisJob job) {
        jpaRepository.deleteById(job.id());
    }
}
