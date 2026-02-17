package at.mymove.inventory.application;

import at.mymove.inventory.domain.InventoryItem;
import at.mymove.inventory.domain.InventoryList;
import at.mymove.inventory.domain.InventoryStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Use Case: Fügt ein Item zu einer bestehenden Inventarliste hinzu.
 */
@Service
@RequiredArgsConstructor
public class AddInventoryItemUseCase {

    private final InventoryRepository inventoryRepository;

    /**
     * Fügt ein manuelles Item zur InventoryList hinzu.
     *
     * @param inventoryId ID der InventoryList
     * @param name        Name des Items
     * @param quantity    Anzahl
     * @return Die aktualisierte InventoryList
     * @throws IllegalArgumentException wenn Inventory nicht existiert oder nicht mehr bearbeitbar
     */
    @Transactional
    public InventoryList execute(UUID inventoryId, String name, int quantity) {
        return execute(inventoryId, name, quantity, null, null);
    }

    /**
     * Fügt ein manuelles Item mit allen Details hinzu.
     */
    @Transactional
    public InventoryList execute(
            UUID inventoryId,
            String name,
            int quantity,
            String category,
            Double volume
    ) {
        if (inventoryId == null) {
            throw new IllegalArgumentException("inventoryId is required");
        }

        InventoryList inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found: " + inventoryId));

        // Nur DRAFT Inventories dürfen bearbeitet werden
        if (inventory.status() != InventoryStatus.DRAFT) {
            throw new IllegalStateException("Cannot add items to confirmed inventory");
        }

        // Manuelles Item erstellen
        InventoryItem newItem = InventoryItem.manual(name, quantity, category, volume);

        // Hinzufügen und speichern
        InventoryList updated = inventory.addItem(newItem);
        return inventoryRepository.save(updated);
    }
}
