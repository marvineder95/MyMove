package at.mymove.offer.domain;

import at.mymove.move.domain.MoveDetails;

import java.time.Instant;
import java.util.UUID;

public record Offer(
        UUID id,
        OfferStatus status,
        UUID videoId,
        MoveDetails moveDetails,
        Instant createdAt,
        Instant sentAt
) {
    public Offer {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (status == null) throw new IllegalArgumentException("status is required");
        if (videoId == null) throw new IllegalArgumentException("videoId is required");
        if (moveDetails == null) throw new IllegalArgumentException("moveDetails is required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");

        if (sentAt != null && status != OfferStatus.SENT) {
            throw new IllegalArgumentException("sentAt must be null unless status is SENT");
        }
        if (sentAt == null && status == OfferStatus.SENT) {
            throw new IllegalArgumentException("sentAt is required when status is SENT");
        }
    }

    public static Offer draft(UUID videoId, MoveDetails moveDetails) {
        if (videoId == null) throw new IllegalArgumentException("videoId is required");
        if (moveDetails == null) throw new IllegalArgumentException("moveDetails is required");

        return new Offer(
                UUID.randomUUID(),
                OfferStatus.DRAFT,
                videoId,
                moveDetails,
                Instant.now(),
                null
        );
    }

    public Offer markReadyToSend() {
        return new Offer(
                this.id,
                OfferStatus.READY_TO_SEND,
                this.videoId,
                this.moveDetails,
                this.createdAt,
                null
        );
    }

    public Offer markSent(Instant now) {
        if (now == null) throw new IllegalArgumentException("now is required");
        return new Offer(
                this.id,
                OfferStatus.SENT,
                this.videoId,
                this.moveDetails,
                this.createdAt,
                now
        );
    }

    public Offer markFailed() {
        return new Offer(
                this.id,
                OfferStatus.FAILED,
                this.videoId,
                this.moveDetails,
                this.createdAt,
                null
        );
    }
}