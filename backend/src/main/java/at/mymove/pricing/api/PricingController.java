package at.mymove.pricing.api;

import at.mymove.pricing.api.dto.PriceEstimateResponse;
import at.mymove.pricing.application.CalculateEstimateUseCase;
import at.mymove.pricing.domain.PriceEstimate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller für Pricing.
 *
 * Endpunkte:
 * - POST /api/v1/pricing/calculate?companyId={}&offerId={}  - Preis berechnen
 * - GET  /api/v1/pricing/estimates/{id}                     - Schätzung abrufen
 * - GET  /api/v1/pricing/estimates/by-offer/{offerId}       - Alle Schätzungen für Offer
 */
@RestController
@RequestMapping("/api/v1/pricing")
@RequiredArgsConstructor
public class PricingController {

    private final CalculateEstimateUseCase calculateEstimateUseCase;

    /**
     * Berechnet eine Preisschätzung für eine Firma und ein Offer.
     */
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN')")
    @PostMapping("/calculate")
    public ResponseEntity<PriceEstimateResponse> calculateEstimate(
            @RequestParam String companyId,
            @RequestParam String offerId
    ) {
        UUID companyUuid = parseUuid(companyId, "companyId");
        UUID offerUuid = parseUuid(offerId, "offerId");

        PriceEstimate estimate = calculateEstimateUseCase.execute(companyUuid, offerUuid);
        return ResponseEntity.ok(PriceEstimateResponse.from(estimate));
    }

    /**
     * Holt eine Preisschätzung anhand ihrer ID.
     */
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN')")
    @GetMapping("/estimates/{id}")
    public ResponseEntity<PriceEstimateResponse> getEstimate(@PathVariable String id) {
        UUID estimateId = parseUuid(id, "id");

        PriceEstimate estimate = calculateEstimateUseCase.findEstimate(estimateId)
                .orElseThrow(() -> new IllegalArgumentException("PriceEstimate not found: " + id));

        return ResponseEntity.ok(PriceEstimateResponse.from(estimate));
    }

    /**
     * Holt alle Preisschätzungen für ein Offer.
     */
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN')")
    @GetMapping("/estimates/by-offer/{offerId}")
    public ResponseEntity<List<PriceEstimateResponse>> getEstimatesByOffer(
            @PathVariable String offerId
    ) {
        UUID offerUuid = parseUuid(offerId, "offerId");

        List<PriceEstimateResponse> estimates = calculateEstimateUseCase
                .findEstimatesForOffer(offerUuid)
                .stream()
                .map(PriceEstimateResponse::from)
                .toList();

        return ResponseEntity.ok(estimates);
    }

    /**
     * Holt die Preisschätzung einer spezifischen Firma für ein Offer.
     */
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN')")
    @GetMapping("/estimates/by-company-and-offer")
    public ResponseEntity<PriceEstimateResponse> getEstimateByCompanyAndOffer(
            @RequestParam String companyId,
            @RequestParam String offerId
    ) {
        UUID companyUuid = parseUuid(companyId, "companyId");
        UUID offerUuid = parseUuid(offerId, "offerId");

        PriceEstimate estimate = calculateEstimateUseCase
                .findEstimateForCompanyAndOffer(companyUuid, offerUuid)
                .orElseThrow(() -> new IllegalArgumentException(
                        "PriceEstimate not found for company " + companyId + " and offer " + offerId));

        return ResponseEntity.ok(PriceEstimateResponse.from(estimate));
    }

    // ---- Helper ----

    private static UUID parseUuid(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(fieldName + " must be a valid UUID");
        }
    }
}
