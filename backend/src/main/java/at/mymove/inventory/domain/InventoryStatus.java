package at.mymove.inventory.domain;

/**
 * Status einer Inventarliste.
 */
public enum InventoryStatus {
    DRAFT,      // Wird vom Kunden bearbeitet (hinzufügen/entfernen/korrigieren)
    CONFIRMED   // Vom Kunden bestätigt, nicht mehr änderbar
}
