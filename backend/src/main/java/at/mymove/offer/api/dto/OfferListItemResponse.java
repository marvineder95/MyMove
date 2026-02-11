package at.mymove.offer.api.dto;

import java.time.Instant;
import java.util.UUID;

public record OfferListItemResponse(
        UUID id,
        String status,
        UUID videoId,
        UUID companyId,
        Instant createdAt,
        Instant sentAt
) {}