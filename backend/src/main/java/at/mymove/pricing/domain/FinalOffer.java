package at.mymove.pricing.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

/**
 * Finale Offerte einer Firma für ein Umzugsangebot.
 *
 * Im Gegensatz zur PriceEstimate (automatische Berechnung) ist dies
 * ein vom Unternehmen bestätigtes und ggf. angepasstes Angebot.
 *
 * @param id                Eindeutige ID der Offerte
 * @param offerId           Referenz zum Offer
 * @param companyId         Referenz zur Firma
 * @param priceEstimateId   Referenz zur zugrundeliegenden Schätzung (optional)
 * @param totalPrice        Endgültiger Preis
 * @param breakdown         Preisaufschlüsselung
 * @param validityDays      Gültigkeit der Offerte in Tagen
 * @param notes             Hinweise/Zusatzinfos zur Offerte
 * @param status            Status der Offerte
 * @param createdAt         Erstellungszeitpunkt
 * @param submittedAt       Abgabezeitpunkt (null bis zur Abgabe)
 * @param acceptedAt        Annahmezeitpunkt (null bis zur Annahme durch Kunden)
 * @param rejectedAt        Ablehnungszeitpunkt
 * @param rejectionReason   Ablehnungsgrund
 */
public record FinalOffer(
        UUID id,
        UUID offerId,
        UUID companyId,
        UUID priceEstimateId,
        BigDecimal totalPrice,
        PriceBreakdown breakdown,
        int validityDays,
        String notes,
        FinalOfferStatus status,
        Instant createdAt,
        Instant submittedAt,
        Instant acceptedAt,
        Instant rejectedAt,
        String rejectionReason
) {

    public FinalOffer {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (offerId == null) throw new IllegalArgumentException("offerId is required");
        if (companyId == null) throw new IllegalArgumentException("companyId is required");
        if (totalPrice == null) throw new IllegalArgumentException("totalPrice is required");
        if (breakdown == null) throw new IllegalArgumentException("breakdown is required");
        if (status == null) throw new IllegalArgumentException("status is required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");

        if (totalPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("totalPrice must not be negative");
        }

        totalPrice = totalPrice.setScale(2, RoundingMode.HALF_UP);

        if (validityDays < 1 || validityDays > 90) {
            throw new IllegalArgumentException("validityDays must be between 1 and 90");
        }

        notes = notes != null ? notes.trim() : null;
        rejectionReason = rejectionReason != null ? rejectionReason.trim() : null;

        // Status-Invarianten
        validateStatusInvariants(status, submittedAt, acceptedAt, rejectedAt, rejectionReason);
    }

    private static void validateStatusInvariants(
            FinalOfferStatus status,
            Instant submittedAt,
            Instant acceptedAt,
            Instant rejectedAt,
            String rejectionReason
    ) {
        switch (status) {
            case DRAFT -> {
                if (submittedAt != null) throw new IllegalArgumentException("submittedAt must be null when status is DRAFT");
                if (acceptedAt != null) throw new IllegalArgumentException("acceptedAt must be null when status is DRAFT");
                if (rejectedAt != null) throw new IllegalArgumentException("rejectedAt must be null when status is DRAFT");
                if (rejectionReason != null) throw new IllegalArgumentException("rejectionReason must be null when status is DRAFT");
            }
            case SUBMITTED -> {
                if (submittedAt == null) throw new IllegalArgumentException("submittedAt is required when status is SUBMITTED");
                if (acceptedAt != null) throw new IllegalArgumentException("acceptedAt must be null when status is SUBMITTED");
                if (rejectedAt != null) throw new IllegalArgumentException("rejectedAt must be null when status is SUBMITTED");
                if (rejectionReason != null) throw new IllegalArgumentException("rejectionReason must be null when status is SUBMITTED");
            }
            case ACCEPTED -> {
                if (submittedAt == null) throw new IllegalArgumentException("submittedAt is required when status is ACCEPTED");
                if (acceptedAt == null) throw new IllegalArgumentException("acceptedAt is required when status is ACCEPTED");
                if (rejectedAt != null) throw new IllegalArgumentException("rejectedAt must be null when status is ACCEPTED");
                if (rejectionReason != null) throw new IllegalArgumentException("rejectionReason must be null when status is ACCEPTED");
            }
            case REJECTED -> {
                if (submittedAt == null) throw new IllegalArgumentException("submittedAt is required when status is REJECTED");
                if (acceptedAt != null) throw new IllegalArgumentException("acceptedAt must be null when status is REJECTED");
                if (rejectedAt == null) throw new IllegalArgumentException("rejectedAt is required when status is REJECTED");
            }
            case EXPIRED -> {
                if (submittedAt == null) throw new IllegalArgumentException("submittedAt is required when status is EXPIRED");
            }
        }
    }

    /**
     * Factory-Methode: Erstellt ein neues FinalOffer aus einer PriceEstimate.
     */
    public static FinalOffer fromEstimate(
            PriceEstimate estimate,
            int validityDays,
            String notes
    ) {
        Instant now = Instant.now();
        return new FinalOffer(
                UUID.randomUUID(),
                estimate.offerId(),
                estimate.companyId(),
                estimate.id(),
                estimate.totalPrice(),
                estimate.breakdown(),
                validityDays,
                notes,
                FinalOfferStatus.DRAFT,
                now,
                null,
                null,
                null,
                null
        );
    }

    /**
     * Factory-Methode: Erstellt ein neues FinalOffer mit angepasstem Preis.
     */
    public static FinalOffer createAdjusted(
            UUID offerId,
            UUID companyId,
            UUID priceEstimateId,
            BigDecimal adjustedPrice,
            PriceBreakdown breakdown,
            int validityDays,
            String notes
    ) {
        Instant now = Instant.now();
        return new FinalOffer(
                UUID.randomUUID(),
                offerId,
                companyId,
                priceEstimateId,
                adjustedPrice,
                breakdown,
                validityDays,
                notes,
                FinalOfferStatus.DRAFT,
                now,
                null,
                null,
                null,
                null
        );
    }

    /**
     * Reicht die Offerte beim Kunden ein.
     */
    public FinalOffer submit(Instant now) {
        if (status != FinalOfferStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT offers can be submitted");
        }
        if (now == null) throw new IllegalArgumentException("now is required");

        return new FinalOffer(
                id,
                offerId,
                companyId,
                priceEstimateId,
                totalPrice,
                breakdown,
                validityDays,
                notes,
                FinalOfferStatus.SUBMITTED,
                createdAt,
                now,
                null,
                null,
                null
        );
    }

    /**
     * Aktualisiert den Preis (nur im DRAFT Status).
     */
    public FinalOffer updatePrice(BigDecimal newPrice, PriceBreakdown newBreakdown, String newNotes) {
        if (status != FinalOfferStatus.DRAFT) {
            throw new IllegalStateException("Price can only be updated in DRAFT status");
        }

        return new FinalOffer(
                id,
                offerId,
                companyId,
                priceEstimateId,
                newPrice,
                newBreakdown,
                validityDays,
                newNotes != null ? newNotes.trim() : notes,
                status,
                createdAt,
                submittedAt,
                acceptedAt,
                rejectedAt,
                rejectionReason
        );
    }

    /**
     * Markiert die Offerte als angenommen (durch Kunden).
     */
    public FinalOffer accept(Instant now) {
        if (status != FinalOfferStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED offers can be accepted");
        }
        if (now == null) throw new IllegalArgumentException("now is required");

        return new FinalOffer(
                id,
                offerId,
                companyId,
                priceEstimateId,
                totalPrice,
                breakdown,
                validityDays,
                notes,
                FinalOfferStatus.ACCEPTED,
                createdAt,
                submittedAt,
                now,
                null,
                null
        );
    }

    /**
     * Markiert die Offerte als abgelehnt (durch Kunden).
     */
    public FinalOffer reject(Instant now, String reason) {
        if (status != FinalOfferStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED offers can be rejected");
        }
        if (now == null) throw new IllegalArgumentException("now is required");
        if (reason == null || reason.isBlank()) throw new IllegalArgumentException("reason is required");

        return new FinalOffer(
                id,
                offerId,
                companyId,
                priceEstimateId,
                totalPrice,
                breakdown,
                validityDays,
                notes,
                FinalOfferStatus.REJECTED,
                createdAt,
                submittedAt,
                null,
                now,
                reason.trim()
        );
    }

    /**
     * Markiert die Offerte als abgelaufen.
     */
    public FinalOffer expire() {
        if (status != FinalOfferStatus.SUBMITTED) {
            throw new IllegalStateException("Only SUBMITTED offers can expire");
        }

        return new FinalOffer(
                id,
                offerId,
                companyId,
                priceEstimateId,
                totalPrice,
                breakdown,
                validityDays,
                notes,
                FinalOfferStatus.EXPIRED,
                createdAt,
                submittedAt,
                null,
                null,
                null
        );
    }

    /**
     * Berechnet das Ablaufdatum.
     */
    public Instant calculateExpiryDate() {
        if (submittedAt == null) {
            return null;
        }
        return submittedAt.plusSeconds(validityDays * 24 * 60 * 60L);
    }

    /**
     * Prüft ob die Offerte abgelaufen ist.
     */
    public boolean isExpired(Instant now) {
        if (status != FinalOfferStatus.SUBMITTED) {
            return false;
        }
        Instant expiry = calculateExpiryDate();
        return expiry != null && !now.isBefore(expiry);
    }
}
