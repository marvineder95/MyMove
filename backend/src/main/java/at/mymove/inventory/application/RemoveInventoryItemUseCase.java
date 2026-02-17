package at.mymove.inventory.application;

import at.mymove.inventory.domain.InventoryList;
import at.mymove.inventory.domain.InventoryStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Use Case: Entfernt ein Item aus der Inventarliste.
 */
@Service
@RequiredArgsConstructor
public class RemoveInventoryItemUseCase {

    private final InventoryRepository inventoryRepository;

    /**
     * Entfernt ein Item anhand seines Index.
     *
     * @param inventoryId ID der InventoryList
     * @param itemIndex   Index des zu entfernenden Items
     * @return Die aktualisierte InventoryList
     */
    @Transactional
    public InventoryList execute(UUID inventoryId, int itemIndex) {
        if (inventoryId == null) {
            throw new IllegalArgumentException("inventoryId is required");
        }

        InventoryList inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found: " + inventoryId));

        if (inventory.status() != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Cannot remove items from confirmed inventory");
        }

        if (itemIndex < 0 || itemIndex >= inventory.items().size()) {
            throw new IndexOutOfBoundsException("Invalid item index: " + itemIndex);
        }

        InventoryList updated = inventory.removeItem(itemIndex);
        return inventoryRepository.save(updated);
    }
}
