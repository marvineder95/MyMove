package at.mymove.offer.domain;

import java.time.Instant;
import java.util.UUID;

public record Offer(
        UUID id,
        OfferStatus status,
        UUID videoId,
        Instant createdAt,
        Instant sentAt
) {
    public Offer {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (status == null) throw new IllegalArgumentException("status is required");
        if (videoId == null) throw new IllegalArgumentException("videoId is required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");

        if (sentAt != null && status != OfferStatus.SENT) {
            throw new IllegalArgumentException("sentAt must be null unless status is SENT");
        }
        if (sentAt == null && status == OfferStatus.SENT) {
            throw new IllegalArgumentException("sentAt is required when status is SENT");
        }
    }

    public static Offer draft(UUID videoId) {
        return new Offer(
                UUID.randomUUID(),
                OfferStatus.DRAFT,
                videoId,
                Instant.now(),
                null
        );
    }

    public Offer markReadyToSend() {
        return new Offer(
                this.id,
                OfferStatus.READY_TO_SEND,
                this.videoId,
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
                this.createdAt,
                now
        );
    }

    public Offer markFailed() {
        return new Offer(
                this.id,
                OfferStatus.FAILED,
                this.videoId,
                this.createdAt,
                null
        );
    }
}