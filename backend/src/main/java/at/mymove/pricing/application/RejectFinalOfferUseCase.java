package at.mymove.pricing.application;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import at.mymove.pricing.domain.FinalOffer;
import at.mymove.pricing.domain.FinalOfferStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Use Case: Ein Kunde lehnt eine FinalOffer ab.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RejectFinalOfferUseCase {

    private final FinalOfferRepository finalOfferRepository;
    private final OfferRepository offerRepository;

    /**
     * Lehnt eine FinalOffer ab.
     *
     * @param finalOfferId ID der abzulehnenden FinalOffer
     * @param reason       Grund für die Ablehnung (optional)
     * @return Die abgelehnte FinalOffer
     */
    @Transactional
    public FinalOffer execute(UUID finalOfferId, String reason) {
        FinalOffer offer = finalOfferRepository.findById(finalOfferId)
                .orElseThrow(() -> new IllegalArgumentException("FinalOffer not found: " + finalOfferId));

        // Nur SUBMITTED darf abgelehnt werden
        if (offer.status() != FinalOfferStatus.SUBMITTED) {
            throw new IllegalStateException("Can only reject offers in SUBMITTED status, current: " + offer.status());
        }

        // Standard-Reason falls keine angegeben
        if (reason == null || reason.isBlank()) {
            reason = "Customer rejected the offer";
        }

        // Ablehnen
        FinalOffer rejected = offer.reject(Instant.now(), reason);
        rejected = finalOfferRepository.save(rejected);

        // Prüfen ob noch andere Angebote existieren
        long remainingOffers = finalOfferRepository.findByOfferId(offer.offerId()).stream()
                .filter(o -> o.status() == FinalOfferStatus.SUBMITTED)
                .filter(o -> !o.isExpired(Instant.now()))
                .count();

        if (remainingOffers == 0) {
            // Keine Angebote mehr → Offer ablehnen
            Offer mainOffer = offerRepository.findById(offer.offerId())
                    .orElseThrow(() -> new IllegalStateException("Offer not found: " + offer.offerId()));
            
            Offer updatedOffer = mainOffer.reject();
            offerRepository.save(updatedOffer);
            
            log.info("All offers rejected for {}, main offer is now REJECTED", offer.offerId());
        }

        log.info("FinalOffer {} rejected: {}", finalOfferId, reason);

        return rejected;
    }
}
