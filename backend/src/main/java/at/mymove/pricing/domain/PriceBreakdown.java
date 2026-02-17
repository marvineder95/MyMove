package at.mymove.pricing.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Detaillierte Aufschlüsselung eines Preises.
 * Zeigt alle Komponenten transparent auf.
 */
public record PriceBreakdown(
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

    public PriceBreakdown {
        // Ensure all values are non-null
        baseFee = defaultZero(baseFee);
        travelFee = defaultZero(travelFee);
        laborCost = defaultZero(laborCost);
        volumeCost = defaultZero(volumeCost);
        floorSurcharge = defaultZero(floorSurcharge);
        distanceSurcharge = defaultZero(distanceSurcharge);
        otherSurcharges = defaultZero(otherSurcharges);
        subtotal = defaultZero(subtotal);
        total = defaultZero(total);
        details = details != null ? Map.copyOf(details) : Map.of();
    }

    /**
     * Erstellt einen neuen Builder für PriceBreakdown.
     */
    public static Builder builder() {
        return new Builder();
    }

    private static BigDecimal defaultZero(BigDecimal value) {
        return value != null ? value.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Builder für PriceBreakdown.
     */
    public static class Builder {
        private BigDecimal baseFee = BigDecimal.ZERO;
        private BigDecimal travelFee = BigDecimal.ZERO;
        private BigDecimal laborCost = BigDecimal.ZERO;
        private BigDecimal volumeCost = BigDecimal.ZERO;
        private BigDecimal floorSurcharge = BigDecimal.ZERO;
        private BigDecimal distanceSurcharge = BigDecimal.ZERO;
        private BigDecimal otherSurcharges = BigDecimal.ZERO;
        private final Map<String, BigDecimal> details = new LinkedHashMap<>();

        public Builder baseFee(BigDecimal value) {
            this.baseFee = value;
            return this;
        }

        public Builder travelFee(BigDecimal value) {
            this.travelFee = value;
            return this;
        }

        public Builder laborCost(BigDecimal value) {
            this.laborCost = value;
            return this;
        }

        public Builder volumeCost(BigDecimal value) {
            this.volumeCost = value;
            return this;
        }

        public Builder floorSurcharge(BigDecimal value) {
            this.floorSurcharge = value;
            return this;
        }

        public Builder distanceSurcharge(BigDecimal value) {
            this.distanceSurcharge = value;
            return this;
        }

        public Builder otherSurcharges(BigDecimal value) {
            this.otherSurcharges = value;
            return this;
        }

        public Builder addDetail(String key, BigDecimal value) {
            if (value != null && value.compareTo(BigDecimal.ZERO) > 0) {
                this.details.put(key, value);
            }
            return this;
        }

        public PriceBreakdown build() {
            BigDecimal subtotal = baseFee
                    .add(travelFee)
                    .add(laborCost)
                    .add(volumeCost)
                    .add(floorSurcharge)
                    .add(distanceSurcharge)
                    .add(otherSurcharges);

            // Total = subtotal (keine Steuer im MVP)
            BigDecimal total = subtotal;

            return new PriceBreakdown(
                    baseFee,
                    travelFee,
                    laborCost,
                    volumeCost,
                    floorSurcharge,
                    distanceSurcharge,
                    otherSurcharges,
                    subtotal,
                    total,
                    details
            );
        }
    }
}
