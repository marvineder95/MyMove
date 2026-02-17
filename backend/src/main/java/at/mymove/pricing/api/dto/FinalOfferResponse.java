package at.mymove.pricing.api.dto;

import at.mymove.pricing.domain.FinalOffer;
import at.mymove.pricing.domain.FinalOfferStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO für FinalOffer.
 */
public record FinalOfferResponse(
        UUID id,
        UUID offerId,
        UUID companyId,
        BigDecimal totalPrice,
        PriceBreakdownResponse breakdown,
        int validityDays,
        String notes,
        FinalOfferStatus status,
        Instant createdAt,
        Instant submittedAt,
        Instant acceptedAt,
        Instant rejectedAt,
        String rejectionReason,
        boolean isExpired
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static FinalOfferResponse from(FinalOffer offer) {
        return new FinalOfferResponse(
                offer.id(),
                offer.offerId(),
                offer.companyId(),
                offer.totalPrice(),
                PriceBreakdownResponse.from(offer.breakdown()),
                offer.validityDays(),
                offer.notes(),
                offer.status(),
                offer.createdAt(),
                offer.submittedAt(),
                offer.acceptedAt(),
                offer.rejectedAt(),
                offer.rejectionReason(),
                offer.isExpired(Instant.now())
        );
    }
}
