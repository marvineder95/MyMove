package at.mymove.offer.domain;

import at.mymove.move.domain.MoveDetails;

import java.time.Instant;
import java.util.UUID;

public record PendingOffer(
        UUID id,
        UUID videoId,
        MoveDetails moveDetails,
        Instant createdAt
) {
    public PendingOffer {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (videoId == null) throw new IllegalArgumentException("videoId is required");
        if (moveDetails == null) throw new IllegalArgumentException("moveDetails is required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");
    }

    public static PendingOffer create(UUID videoId, MoveDetails moveDetails) {
        return new PendingOffer(
                UUID.randomUUID(),
                videoId,
                moveDetails,
                Instant.now()
        );
    }
}
