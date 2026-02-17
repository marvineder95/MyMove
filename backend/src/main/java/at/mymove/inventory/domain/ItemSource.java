package at.mymove.inventory.domain;

/**
 * Quelle eines Inventar-Items.
 * Unterscheidet zwischen KI-erkannten und manuell hinzugefügten Items.
 */
public enum ItemSource {
    AI_DETECTED,    // Von der KI erkannt
    MANUAL          // Vom Benutzer manuell hinzugefügt
}
