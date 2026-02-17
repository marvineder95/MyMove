package at.mymove.pricing.api;

import at.mymove.pricing.api.dto.FinalOfferRequest;
import at.mymove.pricing.api.dto.FinalOfferResponse;
import at.mymove.pricing.application.*;
import at.mymove.pricing.domain.FinalOffer;
import at.mymove.pricing.domain.PriceBreakdown;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller für FinalOffer Management.
 *
 * Company Endpunkte:
 * - POST /api/v1/company/dashboard/offers/{offerId}/final-offer
 * - PUT  /api/v1/company/dashboard/final-offers/{finalOfferId}
 * - POST /api/v1/company/dashboard/final-offers/{finalOfferId}/submit
 *
 * Customer Endpunkte:
 * - GET  /api/v1/offers/{offerId}/final-offers
 * - POST /api/v1/final-offers/{finalOfferId}/accept
 * - POST /api/v1/final-offers/{finalOfferId}/reject
 */
@RestController
@RequiredArgsConstructor
public class FinalOfferController {

    private final SubmitFinalOfferUseCase submitFinalOfferUseCase;
    private final UpdateFinalOfferUseCase updateFinalOfferUseCase;
    private final AcceptFinalOfferUseCase acceptFinalOfferUseCase;
    private final RejectFinalOfferUseCase rejectFinalOfferUseCase;
    private final FinalOfferRepository finalOfferRepository;

    // ========== COMPANY ENDPOINTS ==========

    /**
     * Erstellt eine neue FinalOffer für ein Offer (DRAFT).
     */
    @PreAuthorize("hasRole('COMPANY')")
    @PostMapping("/api/v1/company/dashboard/offers/{offerId}/final-offer")
    public ResponseEntity<FinalOfferResponse> createDraftOffer(
            @PathVariable String offerId,
            @RequestParam String companyId,
            @Valid @RequestBody FinalOfferRequest request
    ) {
        UUID offerUuid = parseUuid(offerId, "offerId");
        UUID companyUuid = parseUuid(companyId, "companyId");

        int validityDays = request.validityDays() != null ? request.validityDays() : 7;

        FinalOffer offer;
        if (Boolean.TRUE.equals(request.acceptEstimatePrice())) {
            // PriceEstimate übernehmen
            offer = submitFinalOfferUseCase.execute(
                    companyUuid, offerUuid, validityDays, request.notes());
        } else {
            // Angepasster Preis - erst DRAFT erstellen
            // Für echten Flow bräuchten wir hier den PriceBreakdown
            // Vereinfacht: Wir nehmen an, dass der Preis aus der Schätzung kommt
            // und der Company erlaubt wird, diesen zu übernehmen
            throw new IllegalArgumentException(
                    "Custom pricing not supported via this endpoint. Use acceptEstimatePrice=true");
        }

        return ResponseEntity.ok(FinalOfferResponse.from(offer));
    }

    /**
     * Aktualisiert eine DRAFT FinalOffer.
     */
    @PreAuthorize("hasRole('COMPANY')")
    @PutMapping("/api/v1/company/dashboard/final-offers/{finalOfferId}")
    public ResponseEntity<FinalOfferResponse> updateDraftOffer(
            @PathVariable String finalOfferId,
            @RequestParam String companyId,
            @Valid @RequestBody FinalOfferRequest request
    ) {
        UUID finalOfferUuid = parseUuid(finalOfferId, "finalOfferId");
        UUID companyUuid = parseUuid(companyId, "companyId");

        // Für MVP: Wir unterstützen nur Notes-Änderungen im DRAFT
        // Preisänderung würde komplexeren Flow benötigen
        FinalOffer offer = updateFinalOfferUseCase.execute(
                finalOfferUuid,
                companyUuid,
                null, // Preis bleibt gleich
                (PriceBreakdown) null,
                request.notes()
        );

        return ResponseEntity.ok(FinalOfferResponse.from(offer));
    }

    /**
     * Reicht eine DRAFT FinalOffer beim Kunden ein.
     */
    @PreAuthorize("hasRole('COMPANY')")
    @PostMapping("/api/v1/company/dashboard/final-offers/{finalOfferId}/submit")
    public ResponseEntity<FinalOfferResponse> submitOffer(
            @PathVariable String finalOfferId,
            @RequestParam String companyId
    ) {
        UUID finalOfferUuid = parseUuid(finalOfferId, "finalOfferId");
        UUID companyUuid = parseUuid(companyId, "companyId");

        // Nur zur Autorisierung prüfen
        FinalOffer offer = finalOfferRepository.findById(finalOfferUuid)
                .orElseThrow(() -> new IllegalArgumentException("FinalOffer not found"));

        if (!offer.companyId().equals(companyUuid)) {
            throw new IllegalArgumentException("Not authorized");
        }

        // Submit via Domain Methode
        FinalOffer submitted = offer.submit(java.time.Instant.now());
        submitted = finalOfferRepository.save(submitted);

        return ResponseEntity.ok(FinalOfferResponse.from(submitted));
    }

    /**
     * Listet alle FinalOffers der eingeloggten Firma.
     */
    @PreAuthorize("hasRole('COMPANY')")
    @GetMapping("/api/v1/company/dashboard/my-offers")
    public ResponseEntity<List<FinalOfferResponse>> getMyOffers(
            @RequestParam String companyId
    ) {
        UUID companyUuid = parseUuid(companyId, "companyId");

        List<FinalOfferResponse> offers = finalOfferRepository
                .findByCompanyId(companyUuid)
                .stream()
                .map(FinalOfferResponse::from)
                .toList();

        return ResponseEntity.ok(offers);
    }

    // ========== CUSTOMER ENDPOINTS ==========

    /**
     * Listet alle FinalOffers für ein Offer (für Kunden-Vergleich).
     */
    @GetMapping("/api/v1/offers/{offerId}/final-offers")
    public ResponseEntity<List<FinalOfferResponse>> getFinalOffersForOffer(
            @PathVariable String offerId
    ) {
        UUID offerUuid = parseUuid(offerId, "offerId");

        List<FinalOfferResponse> offers = finalOfferRepository
                .findByOfferId(offerUuid)
                .stream()
                .filter(o -> o.status() == at.mymove.pricing.domain.FinalOfferStatus.SUBMITTED)
                .filter(o -> !o.isExpired(java.time.Instant.now()))
                .map(FinalOfferResponse::from)
                .toList();

        return ResponseEntity.ok(offers);
    }

    /**
     * Holt das beste Angebot für ein Offer.
     */
    @GetMapping("/api/v1/offers/{offerId}/best-offer")
    public ResponseEntity<FinalOfferResponse> getBestOffer(
            @PathVariable String offerId
    ) {
        UUID offerUuid = parseUuid(offerId, "offerId");

        FinalOffer bestOffer = acceptFinalOfferUseCase.findBestOffer(offerUuid);
        
        if (bestOffer == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(FinalOfferResponse.from(bestOffer));
    }

    /**
     * Kunde nimmt ein FinalOffer an.
     */
    @PostMapping("/api/v1/final-offers/{finalOfferId}/accept")
    public ResponseEntity<FinalOfferResponse> acceptOffer(
            @PathVariable String finalOfferId
    ) {
        UUID finalOfferUuid = parseUuid(finalOfferId, "finalOfferId");

        FinalOffer accepted = acceptFinalOfferUseCase.execute(finalOfferUuid);
        return ResponseEntity.ok(FinalOfferResponse.from(accepted));
    }

    /**
     * Kunde lehnt ein FinalOffer ab.
     */
    @PostMapping("/api/v1/final-offers/{finalOfferId}/reject")
    public ResponseEntity<FinalOfferResponse> rejectOffer(
            @PathVariable String finalOfferId,
            @RequestBody(required = false) RejectRequest request
    ) {
        UUID finalOfferUuid = parseUuid(finalOfferId, "finalOfferId");

        String reason = request != null ? request.reason() : null;
        FinalOffer rejected = rejectFinalOfferUseCase.execute(finalOfferUuid, reason);
        
        return ResponseEntity.ok(FinalOfferResponse.from(rejected));
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

    public record RejectRequest(String reason) {
    }
}
