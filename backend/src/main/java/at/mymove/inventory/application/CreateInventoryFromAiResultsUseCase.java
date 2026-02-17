package at.mymove.inventory.application;

import at.mymove.inventory.domain.InventoryItem;
import at.mymove.inventory.domain.InventoryList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Use Case: Erstellt eine Inventarliste aus KI-Analyse-Ergebnissen.
 *
 * Wird aufgerufen nachdem der AI-Service die Video-Analyse abgeschlossen hat.
 */
@Service
@RequiredArgsConstructor
public class CreateInventoryFromAiResultsUseCase {

    private final InventoryRepository inventoryRepository;

    /**
     * Erstellt eine neue InventoryList aus AI-Ergebnissen.
     *
     * @param offerId         ID des zugehörigen Offers
     * @param aiDetectedItems Liste der erkannten Items (source muss AI_DETECTED sein)
     * @return Die erstellte InventoryList
     * @throws IllegalArgumentException wenn bereits eine Inventory für dieses Offer existiert
     */
    @Transactional
    public InventoryList execute(UUID offerId, List<InventoryItem> aiDetectedItems) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }

        // Prüfen ob bereits eine Inventory für dieses Offer existiert
        if (inventoryRepository.existsByOfferId(offerId)) {
            throw new IllegalArgumentException("Inventory already exists for offer: " + offerId);
        }

        // InventoryList aus AI-Ergebnissen erstellen
        InventoryList inventory = InventoryList.fromAiResults(offerId, aiDetectedItems);

        // Persistieren
        return inventoryRepository.save(inventory);
    }

    /**
     * Erstellt eine leere InventoryList (für den Fall dass AI keine Items erkennt).
     */
    @Transactional
    public InventoryList executeEmpty(UUID offerId) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }

        if (inventoryRepository.existsByOfferId(offerId)) {
            throw new IllegalArgumentException("Inventory already exists for offer: " + offerId);
        }

        InventoryList inventory = InventoryList.createEmpty(offerId);
        return inventoryRepository.save(inventory);
    }
}
