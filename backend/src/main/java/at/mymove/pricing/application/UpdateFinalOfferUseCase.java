package at.mymove.pricing.application;

import at.mymove.pricing.domain.FinalOffer;
import at.mymove.pricing.domain.FinalOfferStatus;
import at.mymove.pricing.domain.PriceBreakdown;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Use Case: Eine Firma aktualisiert ihre DRAFT FinalOffer.
 *
 * Nur erlaubt solange die Offerte noch nicht eingereicht wurde.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateFinalOfferUseCase {

    private final FinalOfferRepository finalOfferRepository;

    /**
     * Aktualisiert eine bestehende DRAFT FinalOffer.
     *
     * @param finalOfferId ID der FinalOffer
     * @param companyId    ID der Firma (zur Autorisierung)
     * @param newPrice     Neuer Preis
     * @param newBreakdown Neue Aufschlüsselung
     * @param newNotes     Neue Hinweise
     * @return Die aktualisierte FinalOffer
     */
    @Transactional
    public FinalOffer execute(
            UUID finalOfferId,
            UUID companyId,
            BigDecimal newPrice,
            PriceBreakdown newBreakdown,
            String newNotes
    ) {
        FinalOffer offer = finalOfferRepository.findById(finalOfferId)
                .orElseThrow(() -> new IllegalArgumentException("FinalOffer not found: " + finalOfferId));

        // Autorisierung prüfen
        if (!offer.companyId().equals(companyId)) {
            throw new IllegalArgumentException("Not authorized to update this offer");
        }

        // Nur DRAFT darf aktualisiert werden
        if (offer.status() != FinalOfferStatus.DRAFT) {
            throw new IllegalStateException("Can only update offers in DRAFT status, current: " + offer.status());
        }

        // Preis muss sich ändern
        if (newPrice == null) {
            newPrice = offer.totalPrice();
        }
        if (newBreakdown == null) {
            newBreakdown = offer.breakdown();
        }

        FinalOffer updated = offer.updatePrice(newPrice, newBreakdown, newNotes);
        FinalOffer saved = finalOfferRepository.save(updated);

        log.info("Company {} updated final offer {}: {} EUR", companyId, finalOfferId, newPrice);

        return saved;
    }
}
