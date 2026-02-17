package at.mymove.inventory.application;

import at.mymove.inventory.domain.InventoryList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Use Case: Liest eine Inventarliste aus.
 */
@Service
@RequiredArgsConstructor
public class GetInventoryUseCase {

    private final InventoryRepository inventoryRepository;

    /**
     * Findet eine InventoryList anhand ihrer ID.
     */
    @Transactional(readOnly = true)
    public Optional<InventoryList> byId(UUID inventoryId) {
        if (inventoryId == null) {
            throw new IllegalArgumentException("inventoryId is required");
        }
        return inventoryRepository.findById(inventoryId);
    }

    /**
     * Findet die InventoryList für ein bestimmtes Offer.
     */
    @Transactional(readOnly = true)
    public Optional<InventoryList> byOfferId(UUID offerId) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }
        return inventoryRepository.findByOfferId(offerId);
    }

    /**
     * Prüft ob eine InventoryList für ein Offer existiert.
     */
    @Transactional(readOnly = true)
    public boolean existsForOffer(UUID offerId) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }
        return inventoryRepository.existsByOfferId(offerId);
    }
}
