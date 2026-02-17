package at.mymove.inventory.application;

import at.mymove.inventory.domain.InventoryList;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository Interface für InventoryList (Domain Layer).
 *
 * Definiert den Vertrag für die Persistenz von Inventarlisten.
 * Implementierung liegt im Infrastructure Layer.
 */
public interface InventoryRepository {

    /**
     * Speichert eine Inventarliste (create oder update).
     */
    InventoryList save(InventoryList inventory);

    /**
     * Findet eine Inventarliste anhand ihrer ID.
     */
    Optional<InventoryList> findById(UUID id);

    /**
     * Findet die Inventarliste für ein bestimmtes Offer.
     */
    Optional<InventoryList> findByOfferId(UUID offerId);

    /**
     * Prüft ob eine Inventarliste für ein Offer existiert.
     */
    boolean existsByOfferId(UUID offerId);

    /**
     * Löscht eine Inventarliste.
     */
    void delete(InventoryList inventory);

    /**
     * Löscht eine Inventarliste anhand ihrer ID.
     */
    void deleteById(UUID id);
}
