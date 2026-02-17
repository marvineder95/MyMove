package at.mymove.inventory.application;

import at.mymove.inventory.domain.InventoryItem;
import at.mymove.inventory.domain.InventoryList;
import at.mymove.inventory.domain.InventoryStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Use Case: Aktualisiert ein bestehendes Item in der Inventarliste.
 */
@Service
@RequiredArgsConstructor
public class UpdateInventoryItemUseCase {

    private final InventoryRepository inventoryRepository;

    /**
     * Aktualisiert ein Item anhand seines Index.
     *
     * @param inventoryId ID der InventoryList
     * @param itemIndex   Index des zu aktualisierenden Items
     * @param newName     Neuer Name (null = unverändert)
     * @param newQuantity Neue Menge (null = unverändert)
     * @return Die aktualisierte InventoryList
     */
    @Transactional
    public InventoryList execute(
            UUID inventoryId,
            int itemIndex,
            String newName,
            Integer newQuantity
    ) {
        if (inventoryId == null) {
            throw new IllegalArgumentException("inventoryId is required");
        }

        InventoryList inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found: " + inventoryId));

        if (inventory.status() != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Cannot update items in confirmed inventory");
        }

        if (itemIndex < 0 || itemIndex >= inventory.items().size()) {
            throw new IndexOutOfBoundsException("Invalid item index: " + itemIndex);
        }

        InventoryItem currentItem = inventory.items().get(itemIndex);
        InventoryItem updatedItem = currentItem;

        // Name aktualisieren
        if (newName != null && !newName.isBlank()) {
            updatedItem = updatedItem.withName(newName.trim());
        }

        // Quantity aktualisieren
        if (newQuantity != null) {
            updatedItem = updatedItem.withQuantity(newQuantity);
        }

        // Bei Änderung wird ein AI_DETECTED Item zu MANUAL
        if (updatedItem.source().name().equals("AI_DETECTED")) {
            updatedItem = updatedItem.toManual();
        }

        InventoryList updated = inventory.updateItem(itemIndex, updatedItem);
        return inventoryRepository.save(updated);
    }
}
