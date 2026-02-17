package at.mymove.pricing.api.dto;

import at.mymove.pricing.domain.PriceEstimate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO für PriceEstimate.
 */
public record PriceEstimateResponse(
        UUID id,
        UUID offerId,
        UUID companyId,
        BigDecimal totalPrice,
        BigDecimal priceRangeLow,
        BigDecimal priceRangeHigh,
        PriceBreakdownResponse breakdown,
        double estimatedHours,
        double estimatedVolume,
        String currency,
        Instant calculatedAt,
        Instant validUntil,
        boolean isValid
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static PriceEstimateResponse from(PriceEstimate estimate) {
        return new PriceEstimateResponse(
                estimate.id(),
                estimate.offerId(),
                estimate.companyId(),
                estimate.totalPrice(),
                estimate.priceRangeLow(),
                estimate.priceRangeHigh(),
                PriceBreakdownResponse.from(estimate.breakdown()),
                estimate.estimatedHours(),
                estimate.estimatedVolume(),
                estimate.currency(),
                estimate.calculatedAt(),
                estimate.validUntil(),
                estimate.isValid(Instant.now())
        );
    }
}
