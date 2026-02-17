package at.mymove.inventory.api.dto;

import at.mymove.inventory.domain.InventoryItem;
import at.mymove.inventory.domain.ItemSource;

/**
 * Response DTO für ein InventoryItem.
 */
public record InventoryItemResponse(
        String name,
        int quantity,
        Double confidence,
        ItemSource source,
        String category,
        Double volume,
        double totalVolume
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static InventoryItemResponse from(InventoryItem item) {
        return new InventoryItemResponse(
                item.name(),
                item.quantity(),
                item.confidence(),
                item.source(),
                item.category(),
                item.volume(),
                item.totalVolume()
        );
    }
}
