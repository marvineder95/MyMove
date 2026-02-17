package at.mymove.pricing.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import at.mymove.pricing.domain.FinalOffer;
import at.mymove.pricing.domain.FinalOfferStatus;
import at.mymove.pricing.domain.PriceBreakdown;
import at.mymove.pricing.domain.PriceEstimate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Use Case: Eine Firma reicht eine finale Offerte ein.
 *
 * Die Offerte kann:
 * 1. Basierend auf einer PriceEstimate erstellt werden (Übernahme der Schätzung)
 * 2. Mit angepasstem Preis erstellt werden (höher/niedriger als Schätzung)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubmitFinalOfferUseCase {

    private final FinalOfferRepository finalOfferRepository;
    private final PriceEstimateRepository priceEstimateRepository;
    private final CompanyRepository companyRepository;
    private final OfferRepository offerRepository;

    /**
     * Reicht eine finale Offerte ein (basierend auf der Schätzung).
     *
     * @param companyId       ID der Firma
     * @param offerId         ID des Offers
     * @param validityDays    Gültigkeit in Tagen (default: 7)
 * @param notes           Optionale Hinweise
     * @return Die eingereichte FinalOffer
     */
    @Transactional
    public FinalOffer execute(UUID companyId, UUID offerId, int validityDays, String notes) {
        // PriceEstimate holen
        PriceEstimate estimate = priceEstimateRepository
                .findByCompanyIdAndOfferId(companyId, offerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No price estimate found for company " + companyId + " and offer " + offerId));

        return execute(companyId, offerId, estimate.id(), estimate.totalPrice(), 
                      estimate.breakdown(), validityDays, notes);
    }

    /**
     * Reicht eine finale Offerte mit angepasstem Preis ein.
     *
     * @param companyId       ID der Firma
     * @param offerId         ID des Offers
     * @param priceEstimateId ID der zugrundeliegenden Schätzung (optional)
     * @param adjustedPrice   Angepasster Preis
     * @param breakdown       Preisaufschlüsselung
     * @param validityDays    Gültigkeit in Tagen
     * @param notes           Optionale Hinweise
     * @return Die eingereichte FinalOffer
     */
    @Transactional
    public FinalOffer execute(
            UUID companyId,
            UUID offerId,
            UUID priceEstimateId,
            BigDecimal adjustedPrice,
            PriceBreakdown breakdown,
            int validityDays,
 String notes
    ) {
        // Validierungen
        if (companyId == null) throw new IllegalArgumentException("companyId is required");
        if (offerId == null) throw new IllegalArgumentException("offerId is required");
        if (adjustedPrice == null) throw new IllegalArgumentException("adjustedPrice is required");
        if (breakdown == null) throw new IllegalArgumentException("breakdown is required");

        // Firma prüfen
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));
        
        if (!company.canReceiveOffers()) {
            throw new IllegalStateException("Company is not approved");
        }

        // Offer prüfen
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + offerId));

        // Prüfen ob bereits eine FinalOffer existiert
        var existingOffer = finalOfferRepository.findByCompanyIdAndOfferId(companyId, offerId);
        if (existingOffer.isPresent()) {
            FinalOffer existing = existingOffer.get();
            if (existing.status() == FinalOfferStatus.SUBMITTED || 
                existing.status() == FinalOfferStatus.ACCEPTED) {
                throw new IllegalStateException("Final offer already submitted for this offer");
            }
            // Bei DRAFT: Löschen und neu erstellen
            finalOfferRepository.delete(existing);
        }

        // FinalOffer erstellen
        FinalOffer finalOffer = FinalOffer.createAdjusted(
                offerId,
                companyId,
                priceEstimateId,
                adjustedPrice,
                breakdown,
                Math.max(1, Math.min(validityDays, 30)), // 1-30 Tage
                notes
        );

        // Als eingereicht markieren
        finalOffer = finalOffer.submit(Instant.now());
        
        // Speichern
        FinalOffer saved = finalOfferRepository.save(finalOffer);
        
        // Offer-Status aktualisieren
        if (offer.status().ordinal() < at.mymove.offer.domain.OfferStatus.FINAL_OFFER_SUBMITTED.ordinal()) {
            Offer updatedOffer = offer.assignCompany(companyId); // oder spezifischere Methode
            offerRepository.save(updatedOffer);
        }

        log.info("Company {} submitted final offer {} for offer {}: {} EUR",
                companyId, saved.id(), offerId, adjustedPrice);

        return saved;
    }
}
