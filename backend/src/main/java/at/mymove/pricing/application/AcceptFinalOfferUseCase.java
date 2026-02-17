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
import java.util.List;
import java.util.UUID;

/**
 * Use Case: Ein Kunde nimmt eine FinalOffer an.
 *
 * Die Offerte wird akzeptiert und alle anderen Offerte für
das gleiche Offer werden automatisch abgelehnt.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AcceptFinalOfferUseCase {

    private final FinalOfferRepository finalOfferRepository;
    private final OfferRepository offerRepository;

    /**
     * Nimmt eine FinalOffer an.
     *
     * @param finalOfferId ID der anzunehmenden FinalOffer
     * @return Die akzeptierte FinalOffer
     */
    @Transactional
    public FinalOffer execute(UUID finalOfferId) {
        FinalOffer offer = finalOfferRepository.findById(finalOfferId)
                .orElseThrow(() -> new IllegalArgumentException("FinalOffer not found: " + finalOfferId));

        // Nur SUBMITTED darf angenommen werden
        if (offer.status() != FinalOfferStatus.SUBMITTED) {
            throw new IllegalStateException("Can only accept offers in SUBMITTED status, current: " + offer.status());
        }

        // Prüfen ob nicht abgelaufen
        if (offer.isExpired(Instant.now())) {
            // Zuerst als expired markieren
            FinalOffer expired = offer.expire();
            finalOfferRepository.save(expired);
            throw new IllegalStateException("Offer has expired");
        }

        // Annehmen
        FinalOffer accepted = offer.accept(Instant.now());
        accepted = finalOfferRepository.save(accepted);

        // Alle anderen Offerte ablehnen
        rejectOtherOffers(offer);

        // Offer aktualisieren
        Offer mainOffer = offerRepository.findById(offer.offerId())
                .orElseThrow(() -> new IllegalStateException("Offer not found: " + offer.offerId()));
        
        Offer updatedOffer = mainOffer.accept();
        offerRepository.save(updatedOffer);

        log.info("FinalOffer {} accepted by customer, offer {} is now ACCEPTED", 
                finalOfferId, offer.offerId());

        return accepted;
    }

    /**
     * Findet die beste/empfohlene Offerte für ein Offer.
     * Nützlich für die UI ("Top-Angebot").
     */
    @Transactional(readOnly = true)
    public FinalOffer findBestOffer(UUID offerId) {
        List<FinalOffer> offers = finalOfferRepository.findByOfferId(offerId);
        
        return offers.stream()
                .filter(o -> o.status() == FinalOfferStatus.SUBMITTED)
                .filter(o -> !o.isExpired(Instant.now()))
                .min(java.util.Comparator.comparing(FinalOffer::totalPrice))
                .orElse(null);
    }

    private void rejectOtherOffers(FinalOffer acceptedOffer) {
        List<FinalOffer> otherOffers = finalOfferRepository.findByOfferId(acceptedOffer.offerId());
        
        for (FinalOffer other : otherOffers) {
            if (!other.id().equals(acceptedOffer.id()) && 
                other.status() == FinalOfferStatus.SUBMITTED) {
                
                FinalOffer rejected = other.reject(Instant.now(), 
                        "Customer accepted another offer");
                finalOfferRepository.save(rejected);
                
                log.debug("Auto-rejected offer {} from company {}", 
                        other.id(), other.companyId());
            }
        }
    }
}
