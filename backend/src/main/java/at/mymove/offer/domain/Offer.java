package at.mymove.offer.domain;

import at.mymove.move.domain.MoveDetails;

import java.time.Instant;
import java.util.UUID;

/**
 * Aggregate Root für ein Umzugsangebot.
 *
 * Repräsentiert einen kompletten Umzugsauftrag von der Erstellung
 * bis zur Annahme durch den Kunden.
 *
 * @param id          Eindeutige ID des Offers
 * @param status      Status im Lifecycle
 * @param videoId     Referenz zum Video
 * @param inventoryId Referenz zur Inventarliste (null bis zur Erstellung)
 * @param companyId   Referenz zur ausgewählten Firma (null bis zur Auswahl)
 * @param moveDetails Umzugsdetails (Adressen, Stockwerke, etc.)
 * @param createdAt   Erstellungszeitpunkt
 * @param updatedAt   Letzte Aktualisierung
 * @param sentAt      Zeitpunkt des Versands (Legacy)
 * @param expiresAt   Ablaufzeitpunkt des Offers
 */
public record Offer(
        UUID id,
        OfferStatus status,
        UUID videoId,
        UUID inventoryId,
        UUID companyId,
        MoveDetails moveDetails,
        Instant createdAt,
        Instant updatedAt,
        Instant sentAt,
        Instant expiresAt
) {

    public Offer {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (status == null) throw new IllegalArgumentException("status is required");
        if (videoId == null) throw new IllegalArgumentException("videoId is required");
        if (moveDetails == null) throw new IllegalArgumentException("moveDetails is required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");

        // Status-Invarianten
        validateStatusInvariants(status, inventoryId, companyId, sentAt);

        // Zeitstempel
        if (updatedAt == null) updatedAt = createdAt;
    }

    private static void validateStatusInvariants(OfferStatus status, UUID inventoryId, UUID companyId, Instant sentAt) {
        // Inventory muss existieren ab INVENTORY_CONFIRMED
        if (status.ordinal() >= OfferStatus.INVENTORY_CONFIRMED.ordinal() && inventoryId == null) {
            throw new IllegalArgumentException("inventoryId is required when status is " + status);
        }

        // Legacy: sentAt nur bei SENT erlaubt
        if (sentAt != null && status != OfferStatus.SENT) {
            throw new IllegalArgumentException("sentAt must be null unless status is SENT");
        }
    }

    /**
     * Factory-Methode: Erstellt ein neues Offer im Status DRAFT.
     */
    public static Offer create(UUID videoId, MoveDetails moveDetails) {
        Instant now = Instant.now();
        return new Offer(
                UUID.randomUUID(),
                OfferStatus.DRAFT,
                videoId,
                null,
                null,
                moveDetails,
                now,
                now,
                null,
                null
        );
    }

    /**
     * Verknüpft das Offer mit einer Inventarliste.
     */
    public Offer attachInventory(UUID inventoryId) {
        if (inventoryId == null) throw new IllegalArgumentException("inventoryId is required");
        if (this.inventoryId != null) {
            throw new IllegalStateException("Inventory already attached to this offer");
        }

        return new Offer(
                this.id,
                OfferStatus.INVENTORY_PENDING,
                this.videoId,
                inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                this.sentAt,
                this.expiresAt
        );
    }

    /**
     * Markiert das Inventory als bestätigt (nach Kundenkorrektur).
     */
    public Offer confirmInventory() {
        if (this.inventoryId == null) {
            throw new IllegalStateException("Cannot confirm inventory: no inventory attached");
        }
        if (this.status != OfferStatus.INVENTORY_PENDING && this.status != OfferStatus.DRAFT) {
            throw new IllegalStateException("Cannot confirm inventory in status: " + this.status);
        }

        return new Offer(
                this.id,
                OfferStatus.INVENTORY_CONFIRMED,
                this.videoId,
                this.inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                this.sentAt,
                this.expiresAt
        );
    }

    /**
     * Markiert das Offer als bereit für Preisschätzungen.
     */
    public Offer markEstimatesReady() {
        if (this.status != OfferStatus.INVENTORY_CONFIRMED) {
            throw new IllegalStateException("Estimates can only be marked ready after inventory confirmation");
        }

        return new Offer(
                this.id,
                OfferStatus.ESTIMATES_READY,
                this.videoId,
                this.inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                this.sentAt,
                this.expiresAt
        );
    }

    /**
     * Weist das Offer einer Firma zu.
     */
    public Offer assignCompany(UUID companyId) {
        if (companyId == null) throw new IllegalArgumentException("companyId is required");

        return new Offer(
                this.id,
                OfferStatus.COMPANY_SELECTED,
                this.videoId,
                this.inventoryId,
                companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                this.sentAt,
                this.expiresAt
        );
    }

    /**
     * Markiert das Offer als akzeptiert.
     */
    public Offer accept() {
        if (this.status != OfferStatus.FINAL_OFFER_SUBMITTED && this.status != OfferStatus.SENT) {
            throw new IllegalStateException("Can only accept offers in FINAL_OFFER_SUBMITTED or SENT status");
        }

        return new Offer(
                this.id,
                OfferStatus.ACCEPTED,
                this.videoId,
                this.inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                this.sentAt,
                null
        );
    }

    /**
     * Markiert das Offer als abgelehnt.
     */
    public Offer reject() {
        if (this.status != OfferStatus.FINAL_OFFER_SUBMITTED && this.status != OfferStatus.SENT) {
            throw new IllegalStateException("Can only reject offers in FINAL_OFFER_SUBMITTED or SENT status");
        }

        return new Offer(
                this.id,
                OfferStatus.REJECTED,
                this.videoId,
                this.inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                this.sentAt,
                null
        );
    }

    /**
     * Markiert das Offer als abgelaufen.
     */
    public Offer expire() {
        return new Offer(
                this.id,
                OfferStatus.EXPIRED,
                this.videoId,
                this.inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                this.sentAt,
                null
        );
    }

    // ---- Legacy Methods ----

    public Offer markReadyToSend() {
        return new Offer(
                this.id,
                OfferStatus.READY_TO_SEND,
                this.videoId,
                this.inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                null,
                this.expiresAt
        );
    }

    public Offer markSent(Instant now) {
        if (now == null) throw new IllegalArgumentException("now is required");
        return new Offer(
                this.id,
                OfferStatus.SENT,
                this.videoId,
                this.inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                now,
                this.expiresAt
        );
    }

    public Offer markFailed() {
        return new Offer(
                this.id,
                OfferStatus.FAILED,
                this.videoId,
                this.inventoryId,
                this.companyId,
                this.moveDetails,
                this.createdAt,
                Instant.now(),
                null,
                this.expiresAt
        );
    }

    /**
     * Prüft ob das Offer aktiv ist (nicht abgeschlossen oder abgelaufen).
     */
    public boolean isActive() {
        return status != OfferStatus.ACCEPTED
                && status != OfferStatus.REJECTED
                && status != OfferStatus.EXPIRED;
    }

    /**
     * Prüft ob das Offer abgelaufen ist.
     */
    public boolean isExpired(Instant now) {
        if (expiresAt == null) return false;
        return now.isAfter(expiresAt);
    }
}
