package at.mymove.move.domain;

public record SpecialRequirements(
        boolean needsBoxes,
        Integer boxesCount
) {
    public SpecialRequirements {
        if (!needsBoxes) {
            boxesCount = null;
        }
    }
}