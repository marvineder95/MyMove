package at.mymove.offer.api;

import at.mymove.offer.api.dto.AssignCompanyRequest;
import at.mymove.offer.api.dto.CreateOfferRequest;
import at.mymove.offer.api.dto.OfferResponse;
import at.mymove.offer.application.AssignCompanyToOfferUseCase;
import at.mymove.offer.application.CreateOfferUseCase;
import at.mymove.offer.application.GetOfferForCompanyUseCase;
import at.mymove.offer.application.GetOffersForCompanyUseCase;
import at.mymove.offer.application.SendOfferForCompanyUseCase;
import at.mymove.offer.domain.Offer;
import at.mymove.infrastructure.security.MyMoveUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class OfferController {

    private final CreateOfferUseCase createOfferUseCase;
    private final SendOfferForCompanyUseCase sendOfferForCompanyUseCase;
    private final GetOffersForCompanyUseCase getOffersForCompanyUseCase;
    private final GetOfferForCompanyUseCase getOfferForCompanyUseCase;
    private final AssignCompanyToOfferUseCase assignCompanyToOfferUseCase;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OfferResponse create(@Valid @RequestBody CreateOfferRequest request) {
        Offer created = createOfferUseCase.execute(request.videoId(), request.toMoveDetails());
        return toResponse(created);
    }

    @PreAuthorize("hasRole('COMPANY')")
    @PostMapping("/{offerId}/send")
    public OfferResponse send(@PathVariable UUID offerId) {
        UUID companyId = requireCompanyId();
        Offer sent = sendOfferForCompanyUseCase.execute(offerId, companyId);
        return toResponse(sent);
    }

    @PreAuthorize("hasRole('COMPANY')")
    @GetMapping
    public List<OfferResponse> listForCompany() {
        UUID companyId = requireCompanyId();
        return getOffersForCompanyUseCase.execute(companyId)
                .stream()
                .map(OfferController::toResponse)
                .toList();
    }

    @PreAuthorize("hasRole('COMPANY')")
    @GetMapping("/{id}")
    public ResponseEntity<OfferResponse> getOfferById(@PathVariable String id) {
        UUID offerId = parseOfferId(id);
        UUID companyId = requireCompanyId();
        Offer offer = getOfferForCompanyUseCase.execute(offerId, companyId);
        return ResponseEntity.ok(toResponse(offer));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{id}/assign-company")
    public OfferResponse assignCompany(
            @PathVariable String id,
            @Valid @RequestBody AssignCompanyRequest request
    ) {
        UUID offerId = parseOfferId(id);
        Offer updated = assignCompanyToOfferUseCase.execute(offerId, request.companyId());
        return toResponse(updated);
    }


    private static OfferResponse toResponse(Offer offer) {
        return new OfferResponse(
                offer.id(),
                offer.status(),
                offer.videoId(),
                offer.createdAt(),
                offer.sentAt()
        );
    }

    private static UUID parseOfferId(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("offerId is required");
        }
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("offerId must be a valid UUID");
        }
    }

    private static UUID requireCompanyId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof MyMoveUserDetails userDetails)) {
            throw new IllegalArgumentException("companyId is required");
        }
        UUID companyId = userDetails.getCompanyId();
        if (companyId == null) {
            throw new IllegalArgumentException("companyId is required");
        }
        return companyId;
    }

}
