package at.mymove.offer.infrastructure.persistence;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    @Override
    public List<Offer> findAll() {
        return jpaRepository.findAll()
                .stream()
                .map(OfferMapper::toDomain)
                .toList();
    }

    @Override
    public List<Offer> findAllByCompanyId(UUID companyId) {
        return jpaRepository.findAllByCompanyId(companyId)
                .stream()
                .map(OfferMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Offer> findByIdAndCompanyId(UUID offerId, UUID companyId) {
        return jpaRepository.findByIdAndCompanyId(offerId, companyId)
                .map(OfferMapper::toDomain);
    }
}
