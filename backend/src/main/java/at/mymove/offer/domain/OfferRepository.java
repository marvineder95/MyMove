package at.mymove.offer.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OfferRepository {

    Offer save(Offer offer);

    Optional<Offer> findById(UUID id);

    List<Offer> findAll();

    List<Offer> findAllByCompanyId(UUID companyId);

    Optional<Offer> findByIdAndCompanyId(UUID offerId, UUID companyId);
}
