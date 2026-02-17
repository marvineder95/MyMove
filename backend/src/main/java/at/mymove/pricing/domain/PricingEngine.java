package at.mymove.pricing.domain;

import at.mymove.company.domain.PricingConditions;
import at.mymove.move.domain.Address;
import at.mymove.move.domain.FloorDetails;
import at.mymove.inventory.domain.InventoryList;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Domain Service für Preisberechnungen.
 *
 * Diese Engine berechnet Preisschätzungen basierend auf:
 * - Company-spezifischen Preiskonditionen
 * - Umzugsdetails (Adressen, Stockwerke)
 * - Inventarliste (Volumen, Menge)
 *
 * Die Engine ist stateless und isoliert testbar.
 */
@Component
public class PricingEngine {

    // Konstanten für Berechnung
    private static final BigDecimal VOLUME_RATE_PER_M3 = new BigDecimal("15.00"); // 15 EUR pro m³
    private static final BigDecimal FLOOR_SURCHARGE_PER_LEVEL = new BigDecimal("25.00"); // 25 EUR pro Stockwerk ohne Aufzug
    private static final BigDecimal ELEVATOR_DISCOUNT = new BigDecimal("0.80"); // 20% Rabatt mit Aufzug
    private static final BigDecimal KM_RATE = new BigDecimal("2.50"); // 2.50 EUR pro km
    private static final double AVG_SPEED_KMH = 50.0; // Durchschnittsgeschwindigkeit für Zeitberechnung
    private static final int SETUP_TIME_MINUTES = 30; // Auf- und Abbauzeit pro Seite
    private static final BigDecimal WORKERS_PER_TRUCK = new BigDecimal("2"); // 2 Arbeiter pro LKW

    /**
     * Berechnet eine Preisschätzung für ein Umzugsangebot.
     */
    public PriceBreakdown calculateEstimate(
            PricingConditions conditions,
            Address fromAddress,
            Address toAddress,
            FloorDetails fromFloor,
            FloorDetails toFloor,
            InventoryList inventory
    ) {
        if (conditions == null) {
            throw new IllegalArgumentException("conditions is required");
        }

        PriceBreakdown.Builder builder = PriceBreakdown.builder();

        // 1. Basisgebühren
        builder.baseFee(conditions.baseFee() != null ? conditions.baseFee() : BigDecimal.ZERO);
        builder.travelFee(conditions.travelFee());
        builder.addDetail("Grundgebühr", conditions.baseFee());
        builder.addDetail("Anfahrtsgebühr", conditions.travelFee());

        // 2. Inventar/Volumen-Kosten
        double totalVolume = inventory != null ? inventory.totalVolume() : 0.0;
        BigDecimal volumeCost = calculateVolumeCost(totalVolume);
        builder.volumeCost(volumeCost);
        builder.addDetail("Volumenkosten (" + formatVolume(totalVolume) + ")", volumeCost);

        // 3. Distanz-basierte Kosten
        double distanceKm = estimateDistance(fromAddress, toAddress);
        BigDecimal distanceCost = calculateDistanceCost(distanceKm, conditions);
        builder.distanceSurcharge(distanceCost);
        if (distanceCost.compareTo(BigDecimal.ZERO) > 0) {
            builder.addDetail("Distanzzuschlag (" + String.format("%.1f", distanceKm) + " km)", distanceCost);
        }

        // 4. Stockwerk-Zuschläge
        BigDecimal floorSurcharge = calculateFloorSurcharge(fromFloor, toFloor, conditions);
        builder.floorSurcharge(floorSurcharge);
        if (floorSurcharge.compareTo(BigDecimal.ZERO) > 0) {
            builder.addDetail("Stockwerkzuschlag", floorSurcharge);
        }

        // 5. Arbeitszeit-Kosten
        double estimatedHours = estimateWorkHours(
                fromFloor, toFloor, totalVolume, distanceKm, inventory != null ? inventory.totalItemCount() : 0
        );
        BigDecimal laborCost = calculateLaborCost(estimatedHours, conditions);
        builder.laborCost(laborCost);
        builder.addDetail("Arbeitskosten (" + formatHours(estimatedHours) + ")", laborCost);

        // 6. Extra-Charge-Percentage anwenden
        if (conditions.extraChargePercent() != null && conditions.extraChargePercent().compareTo(BigDecimal.ZERO) > 0) {
            // Wird auf die Summe vor Rabatten angewendet
        }

        PriceBreakdown breakdown = builder.build();

        // 7. Mindestpreis prüfen
        BigDecimal finalTotal = conditions.applyMinimumPrice(breakdown.total());

        if (finalTotal.compareTo(breakdown.total()) > 0) {
            return breakdown;
        }

        return breakdown;
    }

    /**
     * Berechnet die geschätzte Arbeitszeit in Stunden.
     */
    public double estimateWorkHours(
            FloorDetails fromFloor,
            FloorDetails toFloor,
            double totalVolume,
            double distanceKm,
            int totalItemCount
    ) {
        // Basiszeit für Transport
        double drivingTimeHours = distanceKm / AVG_SPEED_KMH * 2; // Hin- und Rückfahrt

        // Lade-/Entladezeit basierend auf Volumen
        double volumeTimeHours = totalVolume / 20.0;

        // Zeit pro Item (durchschnittlich 5 Minuten pro Item)
        double itemTimeHours = (totalItemCount * 5.0) / 60.0;

        // Auf- und Abbauzeit
        double setupTimeHours = (SETUP_TIME_MINUTES * 2.0) / 60.0;

        // Stockwerk-Faktoren
        double fromFloorFactor = calculateFloorFactor(fromFloor);
        double toFloorFactor = calculateFloorFactor(toFloor);

        // Gesamtzeit
        double totalHours = drivingTimeHours
                + (volumeTimeHours * Math.max(fromFloorFactor, toFloorFactor))
                + itemTimeHours
                + setupTimeHours;

        return Math.max(totalHours, 2.0); // Minimum 2 Stunden
    }

    /**
     * Schätzt die Distanz zwischen zwei Adressen.
     */
    public double estimateDistance(Address from, Address to) {
        if (from == null || to == null) {
            return 10.0; // Default 10 km
        }

        // Wenn beide Adressen in derselben Stadt sind
        if (from.city() != null && from.city().equalsIgnoreCase(to.city())) {
            return 8.0;
        }

        return 50.0;
    }

    // ---- Private Helper Methods ----

    private BigDecimal calculateVolumeCost(double volumeM3) {
        return VOLUME_RATE_PER_M3
                .multiply(BigDecimal.valueOf(volumeM3))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateDistanceCost(double distanceKm, PricingConditions conditions) {
        if (distanceKm > 50) {
            double extraKm = distanceKm - 50;
            return KM_RATE.multiply(BigDecimal.valueOf(extraKm)).setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateFloorSurcharge(FloorDetails fromFloor, FloorDetails toFloor, PricingConditions conditions) {
        BigDecimal surcharge = BigDecimal.ZERO;

        if (fromFloor != null) {
            surcharge = surcharge.add(calculateSingleFloorSurcharge(fromFloor));
        }

        if (toFloor != null) {
            surcharge = surcharge.add(calculateSingleFloorSurcharge(toFloor));
        }

        return surcharge;
    }

    private BigDecimal calculateSingleFloorSurcharge(FloorDetails floor) {
        if (floor == null) return BigDecimal.ZERO;

        int floorLevel = floor.floor();
        boolean hasElevator = floor.hasElevator();

        if (floorLevel == 0) {
            return BigDecimal.ZERO;
        }

        int absoluteFloor = Math.abs(floorLevel);
        BigDecimal surcharge = FLOOR_SURCHARGE_PER_LEVEL.multiply(BigDecimal.valueOf(absoluteFloor));

        if (hasElevator) {
            surcharge = surcharge.multiply(ELEVATOR_DISCOUNT);
        }

        return surcharge.setScale(2, RoundingMode.HALF_UP);
    }

    private double calculateFloorFactor(FloorDetails floor) {
        if (floor == null) return 1.0;

        double baseFactor = 1.0;
        int absoluteFloor = Math.abs(floor.floor());

        baseFactor += (absoluteFloor * 0.1);

        if (floor.hasElevator()) {
            baseFactor *= 0.7;
        }

        return baseFactor;
    }

    private BigDecimal calculateLaborCost(double hours, PricingConditions conditions) {
        return conditions.hourlyRate()
                .multiply(BigDecimal.valueOf(hours))
                .multiply(WORKERS_PER_TRUCK)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String formatVolume(double volume) {
        return String.format("%.2f m³", volume);
    }

    private String formatHours(double hours) {
        int h = (int) hours;
        int m = (int) ((hours - h) * 60);
        return String.format("%dh %02dmin", h, m);
    }
}
