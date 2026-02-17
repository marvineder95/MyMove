package at.mymove.ai.domain;

import java.util.Objects;

/**
 * Ein von der KI erkanntes Objekt im Video.
 *
 * Dies ist das Ergebnis der Open-Vocabulary Detection.
 *
 * @param label         Bezeichnung (z.B. "couch", "dining_table")
 * @param description   Beschreibung (z.B. "3-seater grey fabric sofa")
 * @param confidence    Konfidenz 0.0 - 1.0
 * @param boundingBox   Position im Video (optional)
 * @param estimatedVolumeM3  Geschätztes Volumen in m³ (optional)
 * @param quantity      Anzahl (default: 1)
 */
public record DetectedItem(
        String label,
        String description,
        double confidence,
        BoundingBox boundingBox,
        Double estimatedVolumeM3,
        int quantity
) {

    public DetectedItem {
        if (isBlank(label)) {
            throw new IllegalArgumentException("label is required");
        }
        if (confidence < 0.0 || confidence > 1.0) {
            throw new IllegalArgumentException("confidence must be between 0.0 and 1.0");
        }
        if (quantity < 1) {
            throw new IllegalArgumentException("quantity must be at least 1");
        }

        label = normalize(label);
        description = normalizeOptional(description);

        if (estimatedVolumeM3 != null && estimatedVolumeM3 < 0) {
            throw new IllegalArgumentException("estimatedVolumeM3 must not be negative");
        }
    }

    /**
     * Factory-Methode für einfache Items.
     */
    public static DetectedItem of(String label, double confidence) {
        return new DetectedItem(label, null, confidence, null, null, 1);
    }

    /**
     * Factory-Methode mit Beschreibung.
     */
    public static DetectedItem of(String label, String description, double confidence) {
        return new DetectedItem(label, description, confidence, null, null, 1);
    }

    /**
     * Factory-Methode mit allen Details.
     */
    public static DetectedItem of(String label, String description, double confidence,
                                   double volumeM3, int quantity) {
        return new DetectedItem(label, description, confidence, null, volumeM3, quantity);
    }

    /**
     * Konvertiert zu InventoryItem für die Inventarliste.
     */
    public at.mymove.inventory.domain.InventoryItem toInventoryItem() {
        return at.mymove.inventory.domain.InventoryItem.aiDetected(
                label,
                quantity,
                confidence,
                normalizeCategory(label),
                estimatedVolumeM3
        );
    }

    private static String normalizeCategory(String label) {
        // Einfache Kategorie-Zuordnung basierend auf Label
        String lower = label.toLowerCase();
        if (lower.contains("couch") || lower.contains("sofa") || lower.contains("chair") || lower.contains("bed")) {
            return "Möbel";
        } else if (lower.contains("table") || lower.contains("desk")) {
            return "Tische";
        } else if (lower.contains("tv") || lower.contains("computer") || lower.contains("device")) {
            return "Elektronik";
        } else if (lower.contains("box") || lower.contains("carton")) {
            return "Kisten";
        }
        return "Sonstiges";
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String normalize(String s) {
        Objects.requireNonNull(s, "label");
        return s.trim().toLowerCase();
    }

    private static String normalizeOptional(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
