package at.mymove.company.api.dto;

import at.mymove.company.domain.PricingConditions;

import java.math.BigDecimal;

/**
 * Response DTO für PricingConditions.
 */
public record PricingConditionsResponse(
        BigDecimal hourlyRate,
        BigDecimal travelFee,
        BigDecimal baseFee,
        BigDecimal extraChargePercent,
        BigDecimal minimumPrice,
        String currency
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static PricingConditionsResponse from(PricingConditions pricing) {
        if (pricing == null) {
            return null;
        }
        return new PricingConditionsResponse(
                pricing.hourlyRate(),
                pricing.travelFee(),
                pricing.baseFee(),
                pricing.extraChargePercent(),
                pricing.minimumPrice(),
                pricing.currency()
        );
    }
}
