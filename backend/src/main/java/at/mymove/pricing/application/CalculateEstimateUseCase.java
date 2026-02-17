package at.mymove.pricing.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.inventory.domain.InventoryList;
import at.mymove.inventory.domain.InventoryStatus;
import at.mymove.inventory.application.GetInventoryUseCase;
import at.mymove.move.domain.MoveDetails;
import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import at.mymove.pricing.domain.PriceBreakdown;
import at.mymove.pricing.domain.PriceEstimate;
import at.mymove.pricing.domain.PricingEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Use Case: Berechnet eine Preisschätzung für ein Offer.
 *
 * Diese Schätzung basiert auf den Preiskonditionen einer spezifischen Firma
 * und den Details des Umzugs (MoveDetails + Inventory).
 */
@Service
@RequiredArgsConstructor
public class CalculateEstimateUseCase {

    private final CompanyRepository companyRepository;
    private final OfferRepository offerRepository;
    private final GetInventoryUseCase getInventoryUseCase;
    private final PricingEngine pricingEngine;
    private final PriceEstimateRepository priceEstimateRepository;

    /**
     * Berechnet eine Preisschätzung für eine Firma und ein Offer.
     *
     * @param companyId ID der Firma
     * @param offerId   ID des Offers
     * @return Die berechnete PriceEstimate
     */
    @Transactional
    public PriceEstimate execute(UUID companyId, UUID offerId) {
        // 1. Firma laden
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));

        if (!company.canReceiveOffers()) {
            throw new IllegalStateException("Company is not approved and cannot calculate estimates");
        }

        // 2. Offer laden
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + offerId));

        // 3. Inventory laden
        InventoryList inventory = getInventoryUseCase.byOfferId(offerId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found for offer: " + offerId));

        if (inventory.status() != InventoryStatus.CONFIRMED) {
            throw new IllegalStateException("Inventory must be confirmed before calculating estimates");
        }

        // 4. Berechnung durchführen
        MoveDetails moveDetails = offer.moveDetails();

        PriceBreakdown breakdown = pricingEngine.calculateEstimate(
                company.pricingConditions(),
                moveDetails.fromAddress(),
                moveDetails.toAddress(),
                moveDetails.fromFloor(),
                moveDetails.toFloor(),
                inventory
        );

        // 5. Geschätzte Stunden berechnen
        double estimatedHours = pricingEngine.estimateWorkHours(
                moveDetails.fromFloor(),
                moveDetails.toFloor(),
                inventory.totalVolume(),
                pricingEngine.estimateDistance(moveDetails.fromAddress(), moveDetails.toAddress()),
                inventory.totalItemCount()
        );

        // 6. Mindestpreis anwenden
        BigDecimal finalPrice = company.pricingConditions().applyMinimumPrice(breakdown.total());

        // 7. PriceEstimate erstellen
        PriceEstimate estimate = PriceEstimate.create(
                offerId,
                companyId,
                finalPrice,
                breakdown,
                estimatedHours,
                inventory.totalVolume(),
                7 // 7 Tage gültig
        );

        // 8. Speichern
        return priceEstimateRepository.save(estimate);
    }

    /**
     * Findet eine existierende Schätzung.
     */
    @Transactional(readOnly = true)
    public Optional<PriceEstimate> findEstimate(UUID estimateId) {
        return priceEstimateRepository.findById(estimateId);
    }

    /**
     * Findet alle Schätzungen für ein Offer.
     */
    @Transactional(readOnly = true)
    public java.util.List<PriceEstimate> findEstimatesForOffer(UUID offerId) {
        return priceEstimateRepository.findByOfferId(offerId);
    }

    /**
     * Findet die Schätzung einer spezifischen Firma für ein Offer.
     */
    @Transactional(readOnly = true)
    public Optional<PriceEstimate> findEstimateForCompanyAndOffer(UUID companyId, UUID offerId) {
        return priceEstimateRepository.findByCompanyIdAndOfferId(companyId, offerId);
    }
}
