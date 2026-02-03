package at.mymove.move.domain;

import java.time.LocalDate;

public record MoveDetails(
        Address fromAddress,
        Address toAddress,
        FloorDetails fromFloor,
        FloorDetails toFloor,
        boolean needsBoxes,
        Integer boxesCount,
        LocalDate moveDate,
        SpecialRequirements specialRequirements
) {
    public MoveDetails {
        if (fromAddress == null) throw new IllegalArgumentException("fromAddress is required");
        if (toAddress == null) throw new IllegalArgumentException("toAddress is required");
        if (fromFloor == null) throw new IllegalArgumentException("fromFloor is required");
        if (toFloor == null) throw new IllegalArgumentException("toFloor is required");
        if (moveDate == null) throw new IllegalArgumentException("moveDate is required");
        if (specialRequirements == null) throw new IllegalArgumentException("specialRequirements is required");

        if (needsBoxes && (boxesCount == null || boxesCount <= 0)) {
            throw new IllegalArgumentException("boxesCount must be > 0 when needsBoxes is true");
        }
        if (!needsBoxes && boxesCount != null) {
            throw new IllegalArgumentException("boxesCount must be null when needsBoxes is false");
        }
    }
}