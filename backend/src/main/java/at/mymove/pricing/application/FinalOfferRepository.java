package at.mymove.pricing.application;

import at.mymove.pricing.domain.FinalOffer;
import at.mymove.pricing.domain.FinalOfferStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository Interface für FinalOffer (Domain Layer).
 */
public interface FinalOfferRepository {

    FinalOffer save(FinalOffer offer);

    Optional<FinalOffer> findById(UUID id);

    List<FinalOffer> findByOfferId(UUID offerId);

    List<FinalOffer> findByCompanyId(UUID companyId);

    Optional<FinalOffer> findByCompanyIdAndOfferId(UUID companyId, UUID offerId);

    List<FinalOffer> findByStatus(FinalOfferStatus status);

    void delete(FinalOffer offer);

    void deleteById(UUID id);
}
