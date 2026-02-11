package at.mymove.offer.domain;

import at.mymove.move.domain.MoveDetails;

import java.time.Instant;
import java.util.UUID;

public record Offer(
        UUID id,
        OfferStatus status,
        UUID videoId,
        UUID companyId,
        MoveDetails moveDetails,
        Instant createdAt,
        Instant sentAt
) {
    public Offer {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (status == null) throw new IllegalArgumentException("status is required");
        if (videoId == null) throw new IllegalArgumentException("videoId is required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");

        // companyId ist optional -> keine Pflichtvalidierung

        if (sentAt != null && status != OfferStatus.SENT) {
            throw new IllegalArgumentException("sentAt must be null unless status is SENT");
        }
        if (sentAt == null && status == OfferStatus.SENT) {
            throw new IllegalArgumentException("sentAt is required when status is SENT");
        }
    }

    public static Offer draft(UUID videoId, at.mymove.move.domain.MoveDetails moveDetails) {
        return new Offer(
                UUID.randomUUID(),
                OfferStatus.DRAFT,
                videoId,
                null,
                moveDetails,
                Instant.now(),
                null
        );
    }

    public Offer assignCompany(UUID companyId) {
        if (companyId == null) throw new IllegalArgumentException("companyId is required");
        return new Offer(
                this.id,
                this.status,
                this.videoId,
                companyId,
                moveDetails,
                this.createdAt,
                this.sentAt
        );
    }

    public Offer markReadyToSend() {
        return new Offer(
                this.id,
                OfferStatus.READY_TO_SEND,
                this.videoId,
                this.companyId,
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
                this.companyId,
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
                this.companyId,
                this.moveDetails,
                this.createdAt,
                null
        );
    }
}