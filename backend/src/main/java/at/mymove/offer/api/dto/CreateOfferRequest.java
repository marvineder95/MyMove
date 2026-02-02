package at.mymove.offer.api.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateOfferRequest(
        @NotNull UUID videoId
) {
}