package at.mymove.inventory.application;

import at.mymove.inventory.domain.InventoryItem;
import at.mymove.inventory.domain.InventoryList;
import at.mymove.inventory.domain.InventoryStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Use Case: Ersetzt alle Items einer Inventarliste auf einmal.
 *
 * Nützlich wenn der Kunde die komplette Liste im UI bearbeitet
 * und sie dann speichert.
 */
@Service
@RequiredArgsConstructor
public class ReplaceInventoryItemsUseCase {

    private final InventoryRepository inventoryRepository;

    /**
     * Ersetzt alle Items der InventoryList.
     *
     * @param inventoryId ID der InventoryList
     * @param newItems    Neue Liste von Items
     * @return Die aktualisierte InventoryList
     */
    @Transactional
    public InventoryList execute(UUID inventoryId, List<InventoryItem> newItems) {
        if (inventoryId == null) {
            throw new IllegalArgumentException("inventoryId is required");
        }

        InventoryList inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found: " + inventoryId));

        if (inventory.status() != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Cannot replace items in confirmed inventory");
        }

        InventoryList updated = inventory.replaceAllItems(newItems);
        return inventoryRepository.save(updated);
    }
}
