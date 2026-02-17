package at.mymove.inventory.api.dto;

import at.mymove.inventory.domain.InventoryList;
import at.mymove.inventory.domain.InventoryStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO für eine InventoryList.
 */
public record InventoryResponse(
        UUID id,
        UUID offerId,
        InventoryStatus status,
        List<InventoryItemResponse> items,
        int itemTypeCount,
        int totalItemCount,
        long aiDetectedItemCount,
        long manualItemCount,
        Double averageAiConfidence,
        double totalVolume,
        Instant createdAt,
        Instant confirmedAt
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static InventoryResponse from(InventoryList inventory) {
        List<InventoryItemResponse> itemResponses = inventory.items().stream()
                .map(InventoryItemResponse::from)
                .toList();

        return new InventoryResponse(
                inventory.id(),
                inventory.offerId(),
                inventory.status(),
                itemResponses,
                inventory.itemTypeCount(),
                inventory.totalItemCount(),
                inventory.aiDetectedItemCount(),
                inventory.manualItemCount(),
                inventory.averageAiConfidence().isPresent() ? inventory.averageAiConfidence().getAsDouble() : null,
                inventory.totalVolume(),
                inventory.createdAt(),
                inventory.confirmedAt()
        );
    }
}
