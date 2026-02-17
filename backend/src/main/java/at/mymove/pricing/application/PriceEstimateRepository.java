package at.mymove.pricing.application;

import at.mymove.pricing.domain.PriceEstimate;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository Interface für PriceEstimate (Domain Layer).
 */
public interface PriceEstimateRepository {

    /**
     * Speichert eine PriceEstimate.
     */
    PriceEstimate save(PriceEstimate estimate);

    /**
     * Findet eine PriceEstimate anhand ihrer ID.
     */
    Optional<PriceEstimate> findById(UUID id);

    /**
     * Findet alle Schätzungen für ein Offer.
     */
    List<PriceEstimate> findByOfferId(UUID offerId);

    /**
     * Findet alle Schätzungen einer Firma.
     */
    List<PriceEstimate> findByCompanyId(UUID companyId);

    /**
     * Findet die Schätzung einer Firma für ein spezifisches Offer.
     */
    Optional<PriceEstimate> findByCompanyIdAndOfferId(UUID companyId, UUID offerId);

    /**
     * Löscht eine Schätzung.
     */
    void delete(PriceEstimate estimate);

    /**
     * Löscht eine Schätzung anhand ihrer ID.
     */
    void deleteById(UUID id);
}
