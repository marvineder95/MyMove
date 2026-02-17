package at.mymove.pricing.infrastructure.persistence;

import at.mymove.pricing.application.PriceEstimateRepository;
import at.mymove.pricing.domain.PriceEstimate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementierung des PriceEstimateRepository Interface.
 */
@Repository
@RequiredArgsConstructor
public class PriceEstimateRepositoryImpl implements PriceEstimateRepository {

    private final PriceEstimateJpaRepository jpaRepository;
    private final PriceEstimateMapper mapper;

    @Override
    public PriceEstimate save(PriceEstimate estimate) {
        PriceEstimateJpaEntity entity = mapper.toJpaEntity(estimate);
        PriceEstimateJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomainEntity(saved);
    }

    @Override
    public Optional<PriceEstimate> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomainEntity);
    }

    @Override
    public List<PriceEstimate> findByOfferId(UUID offerId) {
        return jpaRepository.findByOfferId(offerId).stream()
                .map(mapper::toDomainEntity)
                .toList();
    }

    @Override
    public List<PriceEstimate> findByCompanyId(UUID companyId) {
        return jpaRepository.findByCompanyId(companyId).stream()
                .map(mapper::toDomainEntity)
                .toList();
    }

    @Override
    public Optional<PriceEstimate> findByCompanyIdAndOfferId(UUID companyId, UUID offerId) {
        return jpaRepository.findByCompanyIdAndOfferId(companyId, offerId)
                .map(mapper::toDomainEntity);
    }

    @Override
    public void delete(PriceEstimate estimate) {
        jpaRepository.deleteById(estimate.id());
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
