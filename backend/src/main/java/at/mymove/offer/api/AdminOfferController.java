package at.mymove.offer.api;

import at.mymove.offer.api.dto.OfferListItemResponse;
import at.mymove.offer.application.ListOffersAdminUseCase;
import at.mymove.offer.domain.Offer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/offers")
@RequiredArgsConstructor
public class AdminOfferController {

    private final ListOffersAdminUseCase listOffersAdminUseCase;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<OfferListItemResponse> list(@RequestParam(required = false) String companyId) {
        UUID companyUuid = parseCompanyId(companyId);
        return listOffersAdminUseCase.execute(companyUuid)
                .stream()
                .map(AdminOfferController::toListItemResponse)
                .toList();
    }

    private static UUID parseCompanyId(String companyId) {
        if (companyId == null) {
            return null;
        }
        if (companyId.isBlank()) {
            throw new IllegalArgumentException("companyId must be a valid UUID");
        }
        try {
            return UUID.fromString(companyId);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("companyId must be a valid UUID");
        }
    }

    private static OfferListItemResponse toListItemResponse(Offer offer) {
        return new OfferListItemResponse(
                offer.id(),
                offer.status().name(),
                offer.videoId(),
                offer.companyId(),
                offer.createdAt(),
                offer.sentAt()
        );
    }
}
