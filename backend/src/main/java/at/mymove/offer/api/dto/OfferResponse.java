package at.mymove.offer.api.dto;

import at.mymove.offer.domain.OfferStatus;

import java.time.Instant;
import java.util.UUID;

public record OfferResponse(
        UUID id,
        OfferStatus status,
        UUID videoId,
        Instant createdAt,
        Instant sentAt
) {
}