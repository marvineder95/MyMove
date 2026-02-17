package at.mymove.company.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/**
 * Value Object für die Preiskonditionen einer Umzugsfirma.
 * 
 * Definiert die Basis-Preisparameter für die Kalkulation von Angeboten.
 * Diese Konditionen werden bei der Firmen-Registrierung erfasst und
 * später für alle Preisberechnungen verwendet.
 *
 * @param hourlyRate    Stundensatz in EUR (z.B. 65.00)
 * @param travelFee     Anfahrtsgebühr/Fahrtkosten in EUR (z.B. 45.00)
 * @param baseFee       Grundgebühr pro Umzug in EUR (optional, z.B. 25.00)
 * @param extraChargePercent Zuschlag in % für besondere Bedingungen (Stockwerk, Distanz)
 * @param minimumPrice  Mindestpreis in EUR
 * @param currency      Währung (immer EUR für MVP)
 */
public record PricingConditions(
        BigDecimal hourlyRate,
        BigDecimal travelFee,
        BigDecimal baseFee,
        BigDecimal extraChargePercent,
        BigDecimal minimumPrice,
        String currency
) {

    // Konstanten für Validierung
    public static final BigDecimal MAX_HOURLY_RATE = new BigDecimal("500.00");
    public static final BigDecimal MAX_TRAVEL_FEE = new BigDecimal("1000.00");
    public static final BigDecimal MAX_EXTRA_CHARGE_PERCENT = new BigDecimal("100.00");

    public PricingConditions {
        // Validierungen
        if (hourlyRate == null) {
            throw new IllegalArgumentException("hourlyRate is required");
        }
        if (travelFee == null) {
            throw new IllegalArgumentException("travelFee is required");
        }

        // Scale normalisieren (2 Dezimalstellen)
        hourlyRate = hourlyRate.setScale(2, RoundingMode.HALF_UP);
        travelFee = travelFee.setScale(2, RoundingMode.HALF_UP);

        // Wertebereiche prüfen
        if (hourlyRate.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("hourlyRate must be positive");
        }
        if (hourlyRate.compareTo(MAX_HOURLY_RATE) > 0) {
            throw new IllegalArgumentException("hourlyRate exceeds maximum allowed: " + MAX_HOURLY_RATE);
        }

        if (travelFee.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("travelFee must not be negative");
        }
        if (travelFee.compareTo(MAX_TRAVEL_FEE) > 0) {
            throw new IllegalArgumentException("travelFee exceeds maximum allowed: " + MAX_TRAVEL_FEE);
        }

        // Optionale Felder validieren
        if (baseFee != null) {
            baseFee = baseFee.setScale(2, RoundingMode.HALF_UP);
            if (baseFee.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("baseFee must not be negative");
            }
        }

        if (extraChargePercent != null) {
            extraChargePercent = extraChargePercent.setScale(2, RoundingMode.HALF_UP);
            if (extraChargePercent.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("extraChargePercent must not be negative");
            }
            if (extraChargePercent.compareTo(MAX_EXTRA_CHARGE_PERCENT) > 0) {
                throw new IllegalArgumentException("extraChargePercent exceeds maximum allowed: " + MAX_EXTRA_CHARGE_PERCENT);
            }
        }

        if (minimumPrice != null) {
            minimumPrice = minimumPrice.setScale(2, RoundingMode.HALF_UP);
            if (minimumPrice.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("minimumPrice must not be negative");
            }
        }

        // Standardwert für Currency
        if (currency == null || currency.isBlank()) {
            currency = "EUR";
        }
        currency = currency.toUpperCase();
    }

    /**
     * Factory-Methode für die minimalen erforderlichen Felder.
     */
    public static PricingConditions of(BigDecimal hourlyRate, BigDecimal travelFee) {
        return new PricingConditions(hourlyRate, travelFee, null, null, null, "EUR");
    }

    /**
     * Factory-Methode mit allen Feldern.
     */
    public static PricingConditions of(
            BigDecimal hourlyRate,
            BigDecimal travelFee,
            BigDecimal baseFee,
            BigDecimal extraChargePercent,
            BigDecimal minimumPrice
    ) {
        return new PricingConditions(hourlyRate, travelFee, baseFee, extraChargePercent, minimumPrice, "EUR");
    }

    /**
     * Berechnet die effektiven Zuschläge basierend auf Bedingungen.
     * Für spätere Erweiterung (Stockwerk, Distanz, etc.)
     */
    public BigDecimal calculateExtraCharge(BigDecimal baseAmount) {
        if (extraChargePercent == null || extraChargePercent.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return baseAmount
                .multiply(extraChargePercent)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    }

    /**
     * Berechnet den Basis-Preis ohne Zuschläge (Grundgebühr + Anfahrt).
     */
    public BigDecimal calculateBasePrice() {
        BigDecimal price = travelFee;
        if (baseFee != null) {
            price = price.add(baseFee);
        }
        return price;
    }

    /**
     * Wendet den Mindestpreis an, falls der kalkulierte Preis darunter liegt.
     */
    public BigDecimal applyMinimumPrice(BigDecimal calculatedPrice) {
        if (minimumPrice == null) {
            return calculatedPrice;
        }
        return calculatedPrice.max(minimumPrice);
    }

    /**
     * Erstellt eine Kopie mit geändertem Stundensatz.
     */
    public PricingConditions withHourlyRate(BigDecimal newHourlyRate) {
        return new PricingConditions(newHourlyRate, travelFee, baseFee, extraChargePercent, minimumPrice, currency);
    }

    /**
     * Erstellt eine Kopie mit geänderter Anfahrtsgebühr.
     */
    public PricingConditions withTravelFee(BigDecimal newTravelFee) {
        return new PricingConditions(hourlyRate, newTravelFee, baseFee, extraChargePercent, minimumPrice, currency);
    }
}
