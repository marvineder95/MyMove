package at.mymove.inventory.domain;

import java.time.Instant;
import java.util.*;

/**
 * Aggregate Root für eine Inventarliste.
 * Repräsentiert die gesamte Liste der zu transportierenden Items eines Umzugs.
 *
 * Die Liste wird nach Video-Analyse durch KI erstellt und vom Kunden korrigiert.
 * Nach Bestätigung wird sie für die Preisberechnung verwendet.
 *
 * @param id          Eindeutige ID der Inventarliste
 * @param offerId     Referenz zum zugehörigen Offer
 * @param items       Liste der Inventar-Items (immutable)
 * @param status      Status der Liste
 * @param createdAt   Erstellungszeitpunkt
 * @param confirmedAt Zeitpunkt der Bestätigung durch Kunden (null bis zur Bestätigung)
 * @param totalVolume Gesamtvolumen aller Items (gerechnet)
 */
public record InventoryList(
        UUID id,
        UUID offerId,
        List<InventoryItem> items,
        InventoryStatus status,
        Instant createdAt,
        Instant confirmedAt,
        double totalVolume
) {

    public InventoryList {
        if (id == null) {
            throw new IllegalArgumentException("id is required");
        }
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }
        if (status == null) {
            throw new IllegalArgumentException("status is required");
        }
        if (createdAt == null) {
            throw new IllegalArgumentException("createdAt is required");
        }

        // Status-Invarianten
        if (status == InventoryStatus.DRAFT && confirmedAt != null) {
            throw new IllegalArgumentException("confirmedAt must be null when status is DRAFT");
        }
        if (status == InventoryStatus.CONFIRMED && confirmedAt == null) {
            throw new IllegalArgumentException("confirmedAt is required when status is CONFIRMED");
        }

        // Items als unveränderliche Kopie speichern
        items = items != null ? List.copyOf(items) : List.of();

        // Gesamtvolumen berechnen falls nicht explizit gesetzt
        if (totalVolume < 0) {
            throw new IllegalArgumentException("totalVolume must not be negative");
        }
    }

    /**
     * Factory-Methode: Erstellt eine neue leere Inventarliste.
     */
    public static InventoryList createEmpty(UUID offerId) {
        return new InventoryList(
                UUID.randomUUID(),
                offerId,
                List.of(),
                InventoryStatus.DRAFT,
                Instant.now(),
                null,
                0.0
        );
    }

    /**
     * Factory-Methode: Erstellt eine Inventarliste aus KI-Ergebnissen.
     */
    public static InventoryList fromAiResults(UUID offerId, List<InventoryItem> aiDetectedItems) {
        if (aiDetectedItems == null) {
            aiDetectedItems = List.of();
        }
        // Validieren: Alle Items müssen AI_DETECTED sein
        for (InventoryItem item : aiDetectedItems) {
            if (item.source() != ItemSource.AI_DETECTED) {
                throw new IllegalArgumentException("All items from AI results must have source AI_DETECTED");
            }
        }

        double volume = calculateTotalVolume(aiDetectedItems);
        return new InventoryList(
                UUID.randomUUID(),
                offerId,
                aiDetectedItems,
                InventoryStatus.DRAFT,
                Instant.now(),
                null,
                volume
        );
    }

    /**
     * Fügt ein Item zur Liste hinzu.
     */
    public InventoryList addItem(InventoryItem newItem) {
        if (status != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify inventory after confirmation");
        }
        List<InventoryItem> newItems = new ArrayList<>(items);
        newItems.add(newItem);
        return new InventoryList(
                id,
                offerId,
                newItems,
                status,
                createdAt,
                confirmedAt,
                calculateTotalVolume(newItems)
        );
    }

    /**
     * Entfernt ein Item anhand des Index.
     */
    public InventoryList removeItem(int index) {
        if (status != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify inventory after confirmation");
        }
        if (index < 0 || index >= items.size()) {
            throw new IndexOutOfBoundsException("Invalid item index: " + index);
        }
        List<InventoryItem> newItems = new ArrayList<>(items);
        newItems.remove(index);
        return new InventoryList(
                id,
                offerId,
                newItems,
                status,
                createdAt,
                confirmedAt,
                calculateTotalVolume(newItems)
        );
    }

    /**
     * Aktualisiert ein Item anhand des Index.
     */
    public InventoryList updateItem(int index, InventoryItem updatedItem) {
        if (status != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify inventory after confirmation");
        }
        if (index < 0 || index >= items.size()) {
            throw new IndexOutOfBoundsException("Invalid item index: " + index);
        }
        List<InventoryItem> newItems = new ArrayList<>(items);
        newItems.set(index, updatedItem);
        return new InventoryList(
                id,
                offerId,
                newItems,
                status,
                createdAt,
                confirmedAt,
                calculateTotalVolume(newItems)
        );
    }

    /**
     * Ersetzt alle Items (z.B. nach vollständiger Korrektur durch Kunden).
     */
    public InventoryList replaceAllItems(List<InventoryItem> newItems) {
        if (status != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify inventory after confirmation");
        }
        List<InventoryItem> itemsCopy = newItems != null ? List.copyOf(newItems) : List.of();
        return new InventoryList(
                id,
                offerId,
                itemsCopy,
                status,
                createdAt,
                confirmedAt,
                calculateTotalVolume(itemsCopy)
        );
    }

    /**
     * Bestätigt die Inventarliste (nach Kundenkorrektur).
     * Danach keine Änderungen mehr möglich.
     */
    public InventoryList confirm(Instant now) {
        if (status != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT inventories can be confirmed");
        }
        if (now == null) {
            throw new IllegalArgumentException("now is required");
        }
        return new InventoryList(
                id,
                offerId,
                items,
                InventoryStatus.CONFIRMED,
                createdAt,
                now,
                totalVolume
        );
    }

    /**
     * Zählt alle AI-erkannten Items.
     */
    public long aiDetectedItemCount() {
        return items.stream()
                .filter(item -> item.source() == ItemSource.AI_DETECTED)
                .count();
    }

    /**
     * Zählt alle manuell hinzugefügten Items.
     */
    public long manualItemCount() {
        return items.stream()
                .filter(item -> item.source() == ItemSource.MANUAL)
                .count();
    }

    /**
     * Berechnet den Durchschnitts-Confidence aller AI-erkannten Items.
     * Liefert Optional.empty() wenn keine AI-Items vorhanden.
     */
    public OptionalDouble averageAiConfidence() {
        return items.stream()
                .filter(item -> item.source() == ItemSource.AI_DETECTED)
                .mapToDouble(InventoryItem::confidence)
                .average();
    }

    /**
     * Prüft ob die Liste leer ist.
     */
    public boolean isEmpty() {
        return items.isEmpty();
    }

    /**
     * Liefert die Anzahl der verschiedenen Item-Typen.
     */
    public int itemTypeCount() {
        return items.size();
    }

    /**
     * Liefert die Gesamtanzahl aller Items (Summe der Quantities).
     */
    public int totalItemCount() {
        return items.stream()
                .mapToInt(InventoryItem::quantity)
                .sum();
    }

    private static double calculateTotalVolume(List<InventoryItem> items) {
        return items.stream()
                .mapToDouble(InventoryItem::totalVolume)
                .sum();
    }
}
