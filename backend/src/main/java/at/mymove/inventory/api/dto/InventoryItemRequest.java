package at.mymove.inventory.api.dto;

import at.mymove.inventory.domain.InventoryItem;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO zum Hinzufügen/Bearbeiten eines InventoryItems.
 */
public record InventoryItemRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        String category,

        Double volume
) {
    /**
     * Konvertiert zu Domain InventoryItem (immer MANUAL da aus Request).
     */
    public InventoryItem toDomainItem() {
        return InventoryItem.manual(name, quantity, category, volume);
    }
}
