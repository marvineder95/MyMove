package at.mymove.pricing.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;

/**
 * Request DTO für FinalOffer Erstellung/Update.
 */
public record FinalOfferRequest(
        @DecimalMin("0.01") @DecimalMax("100000.00")
        BigDecimal totalPrice,

        @Min(1) @Max(30)
        Integer validityDays,

        String notes,

        // Wenn true, wird die PriceEstimate übernommen
        Boolean acceptEstimatePrice
) {
}
