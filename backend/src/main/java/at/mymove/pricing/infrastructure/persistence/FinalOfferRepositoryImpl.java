package at.mymove.pricing.infrastructure.persistence;

import at.mymove.pricing.application.FinalOfferRepository;
import at.mymove.pricing.domain.FinalOffer;
import at.mymove.pricing.domain.FinalOfferStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementierung des FinalOfferRepository Interface.
 */
@Repository
@RequiredArgsConstructor
public class FinalOfferRepositoryImpl implements FinalOfferRepository {

    private final FinalOfferJpaRepository jpaRepository;
    private final FinalOfferMapper mapper;

    @Override
    public FinalOffer save(FinalOffer offer) {
        FinalOfferJpaEntity entity = mapper.toJpaEntity(offer);
        FinalOfferJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomainEntity(saved);
    }

    @Override
    public Optional<FinalOffer> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomainEntity);
    }

    @Override
    public List<FinalOffer> findByOfferId(UUID offerId) {
        return jpaRepository.findByOfferId(offerId).stream()
                .map(mapper::toDomainEntity)
                .toList();
    }

    @Override
    public List<FinalOffer> findByCompanyId(UUID companyId) {
        return jpaRepository.findByCompanyId(companyId).stream()
                .map(mapper::toDomainEntity)
                .toList();
    }

    @Override
    public Optional<FinalOffer> findByCompanyIdAndOfferId(UUID companyId, UUID offerId) {
        return jpaRepository.findByCompanyIdAndOfferId(companyId, offerId)
                .map(mapper::toDomainEntity);
    }

    @Override
    public List<FinalOffer> findByStatus(FinalOfferStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(mapper::toDomainEntity)
                .toList();
    }

    @Override
    public void delete(FinalOffer offer) {
        jpaRepository.deleteById(offer.id());
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
