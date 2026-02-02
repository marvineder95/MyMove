package at.mymove.offer.infrastructure.persistence;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
class OfferRepositoryImpl implements OfferRepository {

    private final OfferJpaRepository jpaRepository;

    @Override
    public Offer save(Offer offer) {
        OfferJpaEntity entity = OfferMapper.toJpa(offer);
        OfferJpaEntity saved = jpaRepository.save(entity);
        return OfferMapper.toDomain(saved);
    }

    @Override
    public Optional<Offer> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(OfferMapper::toDomain);
    }
}