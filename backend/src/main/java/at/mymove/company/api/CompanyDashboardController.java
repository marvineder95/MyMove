package at.mymove.company.api;

import at.mymove.company.api.dto.CompanyOfferResponse;
import at.mymove.company.application.GetAvailableOffersForCompanyUseCase;
import at.mymove.company.application.GetAvailableOffersForCompanyUseCase.OfferWithEstimate;
import at.mymove.inventory.api.dto.InventoryResponse;
import at.mymove.inventory.application.GetInventoryUseCase;
import at.mymove.inventory.domain.InventoryList;
import at.mymove.move.domain.MoveDetails;
import at.mymove.offer.domain.Offer;
import at.mymove.pricing.api.dto.PriceEstimateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller für das Company Dashboard.
 *
 * Endpunkte:
 * - GET /api/v1/company/dashboard/offers              - Verfügbare Offers
 * - GET /api/v1/company/dashboard/offers/{offerId}    - Offer Details
 * - GET /api/v1/company/dashboard/offers/{offerId}/inventory - Inventory Details
 */
@RestController
@RequestMapping("/api/v1/company/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('COMPANY')")
public class CompanyDashboardController {

    private final GetAvailableOffersForCompanyUseCase getAvailableOffersUseCase;
    private final GetInventoryUseCase getInventoryUseCase;

    /**
     * Listet alle verfügbaren Offers für die eingeloggte Firma.
     */
    @GetMapping("/offers")
    public ResponseEntity<List<CompanyOfferResponse>> getAvailableOffers() {
        UUID companyId = getCurrentCompanyId();

        List<OfferWithEstimate> offers = getAvailableOffersUseCase.execute(companyId);

        List<CompanyOfferResponse> responses = offers.stream()
                .map(this::mapToResponse)
                .toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * Zeigt Details zu einem spezifischen Offer.
     */
    @GetMapping("/offers/{offerId}")
    public ResponseEntity<CompanyOfferResponse> getOfferDetails(@PathVariable String offerId) {
        UUID companyId = getCurrentCompanyId();
        UUID offerUuid = parseUuid(offerId, "offerId");

        OfferWithEstimate offerWithEstimate = getAvailableOffersUseCase
                .getOffer(companyId, offerUuid)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found or not available: " + offerId));

        return ResponseEntity.ok(mapToResponse(offerWithEstimate));
    }

    /**
     * Zeigt das Inventory zu einem Offer.
     */
    @GetMapping("/offers/{offerId}/inventory")
    public ResponseEntity<InventoryResponse> getOfferInventory(@PathVariable String offerId) {
        UUID offerUuid = parseUuid(offerId, "offerId");

        OfferWithEstimate offerWithEstimate = getAvailableOffersUseCase
                .getOffer(getCurrentCompanyId(), offerUuid)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + offerId));

        Offer offer = offerWithEstimate.offer();
        if (offer.inventoryId() == null) {
            throw new IllegalStateException("Offer has no inventory attached");
        }

        InventoryList inventory = getInventoryUseCase.byId(offer.inventoryId())
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found"));

        return ResponseEntity.ok(InventoryResponse.from(inventory));
    }

    // ---- Helper ----

    private CompanyOfferResponse mapToResponse(OfferWithEstimate owe) {
        Offer offer = owe.offer();
        MoveDetails moveDetails = offer.moveDetails();

        return new CompanyOfferResponse(
                offer.id(),
                offer.status(),
                moveDetails.moveDate(),
                moveDetails.fromAddress().city(),
                moveDetails.toAddress().city(),
                moveDetails.fromFloor().floor(),
                moveDetails.toFloor().floor(),
                moveDetails.fromFloor().hasElevator(),
                moveDetails.toFloor().hasElevator(),
                owe.estimate() != null ? PriceEstimateResponse.from(owe.estimate()) : null,
                owe.canSubmitFinalOffer()
        );
    }

    private UUID getCurrentCompanyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Not authenticated");
        }
        // Aus dem User-Account die Company-ID ermitteln
        // Für MVP: Wir verwenden eine vereinfachte Annahme
        // In Produktion: UserDetailsService verwenden
        String email = auth.getName();
        // Hier würde man normalerweise die Company aus dem UserAccount laden
        // Für den MVP returnen wir eine Dummy-UUID basierend auf dem Principal
        return UUID.nameUUIDFromBytes(email.getBytes());
    }

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
