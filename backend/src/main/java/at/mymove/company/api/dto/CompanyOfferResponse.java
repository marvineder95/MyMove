package at.mymove.company.api.dto;

import at.mymove.offer.domain.OfferStatus;
import at.mymove.pricing.api.dto.PriceEstimateResponse;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Response DTO für ein Offer im Company Dashboard.
 */
public record CompanyOfferResponse(
        UUID offerId,
        OfferStatus status,
        LocalDate moveDate,
        String fromCity,
        String toCity,
        int fromFloor,
        int toFloor,
        boolean fromHasElevator,
        boolean toHasElevator,
        PriceEstimateResponse priceEstimate,
        boolean canSubmitFinalOffer
) {
}
