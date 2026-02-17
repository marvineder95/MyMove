package at.mymove.pricing.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

/**
 * Preisschätzung für ein Offer basierend auf Company-Konditionen.
 *
 * Dies ist eine AUTOMATISCHE BERECHNUNG, keine endgültige Offerte.
 * Die Firma kann später daraus ein FinalOffer erstellen.
 *
 * @param id              Eindeutige ID der Schätzung
 * @param offerId         Referenz zum Offer
 * @param companyId       Referenz zur berechnenden Firma
 * @param totalPrice      Gesamtpreis
 * @param priceRangeLow   Untere Grenze des Preisbereichs (Puffer)
 * @param priceRangeHigh  Obere Grenze des Preisbereichs (Puffer)
 * @param breakdown       Detaillierte Aufschlüsselung
 * @param estimatedHours  Geschätzte Arbeitsstunden
 * @param estimatedVolume Geschätztes Volumen in m³
 * @param currency        Währung
 * @param calculatedAt    Zeitpunkt der Berechnung
 * @param validUntil      Gültig bis (z.B. 7 Tage)
 */
public record PriceEstimate(
        UUID id,
        UUID offerId,
        UUID companyId,
        BigDecimal totalPrice,
        BigDecimal priceRangeLow,
        BigDecimal priceRangeHigh,
        PriceBreakdown breakdown,
        double estimatedHours,
        double estimatedVolume,
        String currency,
        Instant calculatedAt,
        Instant validUntil
) {

    public PriceEstimate {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (offerId == null) throw new IllegalArgumentException("offerId is required");
        if (companyId == null) throw new IllegalArgumentException("companyId is required");
        if (totalPrice == null) throw new IllegalArgumentException("totalPrice is required");
        if (breakdown == null) throw new IllegalArgumentException("breakdown is required");
        if (calculatedAt == null) throw new IllegalArgumentException("calculatedAt is required");

        // Preis muss positiv sein
        if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("totalPrice must not be negative");
        }

        // Skalierung sicherstellen
        totalPrice = totalPrice.setScale(2, RoundingMode.HALF_UP);
        if (priceRangeLow != null) {
            priceRangeLow = priceRangeLow.setScale(2, RoundingMode.HALF_UP);
        }
        if (priceRangeHigh != null) {
            priceRangeHigh = priceRangeHigh.setScale(2, RoundingMode.HALF_UP);
        }

        // Standardwert für Währung
        if (currency == null || currency.isBlank()) {
            currency = "EUR";
        }
        currency = currency.toUpperCase();

        // Validierung: priceRangeLow <= totalPrice <= priceRangeHigh
        if (priceRangeLow != null && priceRangeLow.compareTo(totalPrice) > 0) {
            throw new IllegalArgumentException("priceRangeLow must not exceed totalPrice");
        }
        if (priceRangeHigh != null && priceRangeHigh.compareTo(totalPrice) < 0) {
            throw new IllegalArgumentException("priceRangeHigh must not be less than totalPrice");
        }
    }

    /**
     * Factory-Methode: Erstellt eine PriceEstimate aus dem PricingEngine-Ergebnis.
     */
    public static PriceEstimate create(
            UUID offerId,
            UUID companyId,
            BigDecimal totalPrice,
            PriceBreakdown breakdown,
            double estimatedHours,
            double estimatedVolume,
            int validityDays
    ) {
        Instant now = Instant.now();
        Instant validUntil = now.plusSeconds(validityDays * 24 * 60 * 60L);

        // Berechne Preisbereich (±15% als Standard)
        BigDecimal low = totalPrice.multiply(new BigDecimal("0.85")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal high = totalPrice.multiply(new BigDecimal("1.15")).setScale(2, RoundingMode.HALF_UP);

        return new PriceEstimate(
                UUID.randomUUID(),
                offerId,
                companyId,
                totalPrice,
                low,
                high,
                breakdown,
                estimatedHours,
                estimatedVolume,
                "EUR",
                now,
                validUntil
        );
    }

    /**
     * Prüft ob die Schätzung noch gültig ist.
     */
    public boolean isValid(Instant now) {
        return validUntil == null || now.isBefore(validUntil);
    }

    /**
     * Prüft ob die Schätzung abgelaufen ist.
     */
    public boolean isExpired(Instant now) {
        return validUntil != null && !now.isBefore(validUntil);
    }

    /**
     * Formatiert den Preisbereich als lesbaren String.
     * z.B. "850,00 € - 1.150,00 €"
     */
    public String formattedPriceRange() {
        if (priceRangeLow == null || priceRangeHigh == null) {
            return totalPrice + " " + currency;
        }
        return String.format("%s %s - %s %s",
                priceRangeLow.toPlainString(),
                currency,
                priceRangeHigh.toPlainString(),
                currency
        );
    }
}
