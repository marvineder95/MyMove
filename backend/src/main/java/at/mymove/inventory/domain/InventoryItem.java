package at.mymove.inventory.domain;

import java.util.Objects;

/**
 * Ein einzelnes Inventar-Item innerhalb einer Inventarliste.
 * Immutable Value Object.
 *
 * @param name          Name des Items (z.B. "Couch", "Kühlschrank")
 * @param quantity      Anzahl (mindestens 1)
 * @param confidence    Konfidenz-Level (0.0 - 1.0), null bei manuellen Items
 * @param source        Quelle: AI_DETECTED oder MANUAL
 * @param category      Optionale Kategorie für Gruppierung
 * @param volume        Optionales Volumen in m³ für Preisberechnung
 */
public record InventoryItem(
        String name,
        int quantity,
        Double confidence,
        ItemSource source,
        String category,
        Double volume
) {

    public InventoryItem {
        // Validierungen
        if (isBlank(name)) {
            throw new IllegalArgumentException("name is required");
        }
        if (quantity < 1) {
            throw new IllegalArgumentException("quantity must be at least 1");
        }
        if (source == null) {
            throw new IllegalArgumentException("source is required");
        }

        // Confidence nur bei AI_DETECTED erlaubt
        if (source == ItemSource.AI_DETECTED) {
            if (confidence == null) {
                throw new IllegalArgumentException("confidence is required for AI_DETECTED items");
            }
            if (confidence < 0.0 || confidence > 1.0) {
                throw new IllegalArgumentException("confidence must be between 0.0 and 1.0");
            }
        }

        // Normalisierung
        name = normalize(name);
        category = normalizeOptional(category);

        // Volume optional validieren
        if (volume != null && volume < 0) {
            throw new IllegalArgumentException("volume must not be negative");
        }
    }

    /**
     * Factory-Methode für manuell hinzugefügte Items.
     */
    public static InventoryItem manual(String name, int quantity) {
        return new InventoryItem(name, quantity, null, ItemSource.MANUAL, null, null);
    }

    /**
     * Factory-Methode für manuell hinzugefügte Items mit Kategorie und Volumen.
     */
    public static InventoryItem manual(String name, int quantity, String category, Double volume) {
        return new InventoryItem(name, quantity, null, ItemSource.MANUAL, category, volume);
    }

    /**
     * Factory-Methode für KI-erkannte Items.
     */
    public static InventoryItem aiDetected(String name, int quantity, double confidence) {
        return new InventoryItem(name, quantity, confidence, ItemSource.AI_DETECTED, null, null);
    }

    /**
     * Factory-Methode für KI-erkannte Items mit allen Details.
     */
    public static InventoryItem aiDetected(String name, int quantity, double confidence, String category, Double volume) {
        return new InventoryItem(name, quantity, confidence, ItemSource.AI_DETECTED, category, volume);
    }

    /**
     * Erstellt eine Kopie mit geänderter Menge.
     */
    public InventoryItem withQuantity(int newQuantity) {
        return new InventoryItem(name, newQuantity, confidence, source, category, volume);
    }

    /**
     * Erstellt eine Kopie mit geändertem Namen.
     */
    public InventoryItem withName(String newName) {
        return new InventoryItem(newName, quantity, confidence, source, category, volume);
    }

    /**
     * Konvertiert ein AI_DETECTED Item zu einem MANUAL Item (z.B. nach Korrektur).
     */
    public InventoryItem toManual() {
        if (source == ItemSource.MANUAL) {
            return this;
        }
        return new InventoryItem(name, quantity, null, ItemSource.MANUAL, category, volume);
    }

    /**
     * Berechnet das Gesamtvolumen dieses Items (quantity * volume).
     * Liefert 0.0 wenn kein Volumen hinterlegt ist.
     */
    public double totalVolume() {
        if (volume == null) {
            return 0.0;
        }
        return volume * quantity;
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String normalize(String s) {
        Objects.requireNonNull(s, "name");
        return s.trim();
    }

    private static String normalizeOptional(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
