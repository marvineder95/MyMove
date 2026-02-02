package at.mymove.offer.domain;

import java.util.Optional;
import java.util.UUID;

public interface OfferRepository {

    Offer save(Offer offer);

    Optional<Offer> findById(UUID id);
}