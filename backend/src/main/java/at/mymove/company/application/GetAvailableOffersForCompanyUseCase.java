package at.mymove.company.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import at.mymove.offer.domain.OfferStatus;
import at.mymove.pricing.domain.PriceEstimate;
import at.mymove.pricing.application.CalculateEstimateUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Use Case: Holt alle verfügbaren Offers für eine Firma.
 *
 * Verfügbare Offers sind:
 * - Im Status ESTIMATES_READY oder höher
 * - Für die eine Preisschätzung existiert
 * - Noch nicht einer anderen Firma zugewiesen (oder an diese Firma)
 */
@Service
@RequiredArgsConstructor
public class GetAvailableOffersForCompanyUseCase {

    private final CompanyRepository companyRepository;
    private final OfferRepository offerRepository;
    private final CalculateEstimateUseCase calculateEstimateUseCase;

    /**
     * DTO für Offer mit Schätzungs-Info.
     */
    public record OfferWithEstimate(
            Offer offer,
            PriceEstimate estimate,
            boolean canSubmitFinalOffer
    ) {}

    /**
     * Holt alle verfügbaren Offers für eine Firma.
     *
     * @param companyId ID der Firma
     * @return Liste von Offers mit deren Schätzungen
     */
    @Transactional(readOnly = true)
    public List<OfferWithEstimate> execute(UUID companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));

        if (!company.canReceiveOffers()) {
            throw new IllegalStateException("Company is not approved");
        }

        // Alle Offers im Status ESTIMATES_READY oder höher
        List<Offer> availableOffers = offerRepository.findByStatusIn(List.of(
                OfferStatus.ESTIMATES_READY,
                OfferStatus.COMPANY_SELECTED,
                OfferStatus.FINAL_OFFER_PENDING,
                OfferStatus.FINAL_OFFER_SUBMITTED
        ));

        return availableOffers.stream()
                .map(offer -> mapToOfferWithEstimate(offer, companyId))
                .filter(owe -> owe.estimate() != null) // Nur Offers mit Schätzung
                .toList();
    }

    /**
     * Holt ein spezifisches Offer mit Details für eine Firma.
     */
    @Transactional(readOnly = true)
    public Optional<OfferWithEstimate> getOffer(UUID companyId, UUID offerId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + companyId));

        if (!company.canReceiveOffers()) {
            throw new IllegalStateException("Company is not approved");
        }

        return offerRepository.findById(offerId)
                .map(offer -> mapToOfferWithEstimate(offer, companyId));
    }

    private OfferWithEstimate mapToOfferWithEstimate(Offer offer, UUID companyId) {
        Optional<PriceEstimate> estimate = calculateEstimateUseCase
                .findEstimateForCompanyAndOffer(companyId, offer.id());

        // Firma kann ein FinalOffer einreichen wenn:
        // - Eine Schätzung existiert
        // - Das Offer noch nicht einer anderen Firma zugewiesen ist
        boolean canSubmit = estimate.isPresent() &&
                (offer.companyId() == null || offer.companyId().equals(companyId));

        return new OfferWithEstimate(
                offer,
                estimate.orElse(null),
                canSubmit
        );
    }
}
