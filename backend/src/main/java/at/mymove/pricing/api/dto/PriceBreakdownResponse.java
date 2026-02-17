package at.mymove.pricing.api.dto;

import at.mymove.pricing.domain.PriceBreakdown;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Response DTO für PriceBreakdown.
 */
public record PriceBreakdownResponse(
        BigDecimal baseFee,
        BigDecimal travelFee,
        BigDecimal laborCost,
        BigDecimal volumeCost,
        BigDecimal floorSurcharge,
        BigDecimal distanceSurcharge,
        BigDecimal otherSurcharges,
        BigDecimal subtotal,
        BigDecimal total,
        Map<String, BigDecimal> details
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static PriceBreakdownResponse from(PriceBreakdown breakdown) {
        if (breakdown == null) {
            return null;
        }
        return new PriceBreakdownResponse(
                breakdown.baseFee(),
                breakdown.travelFee(),
                breakdown.laborCost(),
                breakdown.volumeCost(),
                breakdown.floorSurcharge(),
                breakdown.distanceSurcharge(),
                breakdown.otherSurcharges(),
                breakdown.subtotal(),
                breakdown.total(),
                breakdown.details()
        );
    }
}
