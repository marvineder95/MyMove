package at.mymove.move.domain;

public record FloorDetails(
        int floor,               // 0 = EG, 1 = 1. Stock, -1 = Keller etc.
        boolean hasElevator,
        boolean needsNoParkingZone,
        Integer walkingDistanceMeters,  // optional (z.B. wenn kein direktes Parken möglich)
        boolean narrowStairs,            // optional/indikativ
        boolean carryOverThresholds      // optional/indikativ
) {
    public FloorDetails {
        if (floor < -10 || floor > 200) {
            throw new IllegalArgumentException("floor out of range");
        }
        if (walkingDistanceMeters != null && (walkingDistanceMeters < 0 || walkingDistanceMeters > 2000)) {
            throw new IllegalArgumentException("walkingDistanceMeters out of range");
        }
    }

    public static FloorDetails groundFloor(boolean hasElevator, boolean needsNoParkingZone) {
        return new FloorDetails(0, hasElevator, needsNoParkingZone, null, false, false);
    }
}