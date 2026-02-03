package at.mymove.offer.api.dto;

import at.mymove.move.domain.Address;
import at.mymove.move.domain.FloorDetails;
import at.mymove.move.domain.MoveDetails;
import at.mymove.move.domain.SpecialRequirements;

import java.time.LocalDate;
import java.util.UUID;

public record CreateOfferRequest(
        UUID videoId,
        Address fromAddress,
        Address toAddress,
        FloorDetails fromFloor,
        FloorDetails toFloor,
        boolean needsBoxes,
        Integer boxesCount,
        LocalDate moveDate,
        SpecialRequirements specialRequirements
) {
    public MoveDetails toMoveDetails() {
        return new MoveDetails(
                fromAddress,
                toAddress,
                fromFloor,
                toFloor,
                needsBoxes,
                boxesCount,
                moveDate,
                specialRequirements
        );
    }
}