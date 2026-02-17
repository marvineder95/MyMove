package at.mymove.offer.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository Interface für Offer (Domain Layer).
 */
public interface OfferRepository {

    Offer save(Offer offer);

    Optional<Offer> findById(UUID id);

    List<Offer> findAll();

    List<Offer> findAllByCompanyId(UUID companyId);

    Optional<Offer> findByIdAndCompanyId(UUID offerId, UUID companyId);

    /**
     * Findet Offers mit einem der angegebenen Status.
     */
    List<Offer> findByStatusIn(List<OfferStatus> statuses);

    /**
     * Findet Offers mit einem spezifischen Status.
     */
    List<Offer> findByStatus(OfferStatus status);
}
