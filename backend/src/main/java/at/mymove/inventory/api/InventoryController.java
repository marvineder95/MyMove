package at.mymove.inventory.api;

import at.mymove.inventory.api.dto.InventoryItemRequest;
import at.mymove.inventory.api.dto.InventoryResponse;
import at.mymove.inventory.application.*;
import at.mymove.inventory.domain.InventoryList;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller für Inventory Management.
 *
 * Endpunkte:
 * - GET  /api/v1/inventories/{id}           - Inventory abrufen
 * - GET  /api/v1/inventories/by-offer/{offerId} - Inventory für Offer abrufen
 * - POST /api/v1/inventories/{id}/items     - Item hinzufügen
 * - PATCH /api/v1/inventories/{id}/items/{index} - Item aktualisieren
 * - DELETE /api/v1/inventories/{id}/items/{index} - Item entfernen
 * - PUT /api/v1/inventories/{id}/items      - Alle Items ersetzen
 * - POST /api/v1/inventories/{id}/confirm   - Inventory bestätigen
 */
@RestController
@RequestMapping("/api/v1/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final GetInventoryUseCase getInventoryUseCase;
    private final AddInventoryItemUseCase addInventoryItemUseCase;
    private final UpdateInventoryItemUseCase updateInventoryItemUseCase;
    private final RemoveInventoryItemUseCase removeInventoryItemUseCase;
    private final ReplaceInventoryItemsUseCase replaceInventoryItemsUseCase;
    private final ConfirmInventoryUseCase confirmInventoryUseCase;

    /**
     * Holt eine InventoryList anhand ihrer ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getById(@PathVariable String id) {
        UUID inventoryId = parseUuid(id, "id");

        InventoryList inventory = getInventoryUseCase.byId(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found: " + id));

        return ResponseEntity.ok(InventoryResponse.from(inventory));
    }

    /**
     * Holt die InventoryList für ein bestimmtes Offer.
     */
    @GetMapping("/by-offer/{offerId}")
    public ResponseEntity<InventoryResponse> getByOfferId(@PathVariable String offerId) {
        UUID offerUuid = parseUuid(offerId, "offerId");

        InventoryList inventory = getInventoryUseCase.byOfferId(offerUuid)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found for offer: " + offerId));

        return ResponseEntity.ok(InventoryResponse.from(inventory));
    }

    /**
     * Fügt ein Item zur InventoryList hinzu.
     */
    @PostMapping("/{id}/items")
    public ResponseEntity<InventoryResponse> addItem(
            @PathVariable String id,
            @Valid @RequestBody InventoryItemRequest request
    ) {
        UUID inventoryId = parseUuid(id, "id");

        InventoryList updated = addInventoryItemUseCase.execute(
                inventoryId,
                request.name(),
                request.quantity(),
                request.category(),
                request.volume()
        );

        return ResponseEntity.ok(InventoryResponse.from(updated));
    }

    /**
     * Aktualisiert ein bestehendes Item.
     */
    @PatchMapping("/{id}/items/{index}")
    public ResponseEntity<InventoryResponse> updateItem(
            @PathVariable String id,
            @PathVariable int index,
            @RequestBody UpdateItemRequest request
    ) {
        UUID inventoryId = parseUuid(id, "id");

        InventoryList updated = updateInventoryItemUseCase.execute(
                inventoryId,
                index,
                request.name(),
                request.quantity()
        );

        return ResponseEntity.ok(InventoryResponse.from(updated));
    }

    /**
     * Entfernt ein Item aus der InventoryList.
     */
    @DeleteMapping("/{id}/items/{index}")
    public ResponseEntity<InventoryResponse> removeItem(
            @PathVariable String id,
            @PathVariable int index
    ) {
        UUID inventoryId = parseUuid(id, "id");

        InventoryList updated = removeInventoryItemUseCase.execute(inventoryId, index);
        return ResponseEntity.ok(InventoryResponse.from(updated));
    }

    /**
     * Ersetzt alle Items der InventoryList (Bulk Update).
     */
    @PutMapping("/{id}/items")
    public ResponseEntity<InventoryResponse> replaceItems(
            @PathVariable String id,
            @Valid @RequestBody List<InventoryItemRequest> requests
    ) {
        UUID inventoryId = parseUuid(id, "id");

        var items = requests.stream()
                .map(InventoryItemRequest::toDomainItem)
                .toList();

        InventoryList updated = replaceInventoryItemsUseCase.execute(inventoryId, items);
        return ResponseEntity.ok(InventoryResponse.from(updated));
    }

    /**
     * Bestätigt die InventoryList (nach Kundenkorrektur).
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<InventoryResponse> confirm(@PathVariable String id) {
        UUID inventoryId = parseUuid(id, "id");

        InventoryList confirmed = confirmInventoryUseCase.execute(inventoryId);
        return ResponseEntity.ok(InventoryResponse.from(confirmed));
    }

    // ---- Helper ----

    private static UUID parseUuid(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(fieldName + " must be a valid UUID");
        }
    }

    /**
     * Inner class für Update Request (beide Felder optional).
     */
    public static record UpdateItemRequest(
            String name,
            Integer quantity
    ) {
    }
}
