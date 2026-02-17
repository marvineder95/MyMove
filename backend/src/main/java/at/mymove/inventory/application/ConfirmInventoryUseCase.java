package at.mymove.inventory.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.company.domain.CompanyStatus;
import at.mymove.inventory.domain.InventoryList;
import at.mymove.inventory.domain.InventoryStatus;
import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import at.mymove.pricing.application.CalculateEstimateUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Use Case: Bestätigt die Inventarliste nach Kundenkorrektur.
 *
 * Nach der Bestätigung:
 * 1. Kann die Liste nicht mehr bearbeitet werden
 * 2. Wird das zugehörige Offer auf INVENTORY_CONFIRMED gesetzt
 * 3. Werden automatisch Preisschätzungen für alle genehmigten Firmen berechnet
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConfirmInventoryUseCase {

    private final InventoryRepository inventoryRepository;
    private final OfferRepository offerRepository;
    private final CompanyRepository companyRepository;
    private final CalculateEstimateUseCase calculateEstimateUseCase;

    /**
     * Bestätigt die InventoryList.
     *
     * @param inventoryId ID der InventoryList
     * @return Die bestätigte InventoryList
     * @throws IllegalArgumentException wenn Inventory nicht existiert
     * @throws IllegalStateException    wenn Inventory bereits bestätigt
     */
    @Transactional
    public InventoryList execute(UUID inventoryId) {
        if (inventoryId == null) {
            throw new IllegalArgumentException("inventoryId is required");
        }

        InventoryList inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory not found: " + inventoryId));

        // Prüfen ob bereits bestätigt
        if (inventory.status() == InventoryStatus.CONFIRMED) {
            throw new IllegalStateException("Inventory is already confirmed");
        }

        // Bestätigen
        InventoryList confirmed = inventory.confirm(Instant.now());
        InventoryList saved = inventoryRepository.save(confirmed);

        // Zugehöriges Offer aktualisieren und Schätzungen berechnen
        processInventoryConfirmation(saved);

        return saved;
    }

    /**
     * Nach der Bestätigung:
     * 1. Offer-Status aktualisieren
     * 2. Preisschätzungen für alle approved Companies berechnen
     */
    private void processInventoryConfirmation(InventoryList inventory) {
        // Offer finden und aktualisieren
        Offer offer = offerRepository.findById(inventory.offerId())
                .orElse(null);

        if (offer == null) {
            log.warn("No offer found for inventory {} - skipping estimate calculation", inventory.id());
            return;
        }

        // Inventory an Offer anhängen und bestätigen
        Offer updatedOffer = offer.attachInventory(inventory.id())
                .confirmInventory()
                .markEstimatesReady();

        offerRepository.save(updatedOffer);
        log.info("Updated offer {} to status ESTIMATES_READY", offer.id());

        // Preisschätzungen für alle approved Companies berechnen
        calculateEstimatesForAllCompanies(updatedOffer);
    }

    /**
     * Berechnet Preisschätzungen für alle genehmigten Firmen.
     */
    private void calculateEstimatesForAllCompanies(Offer offer) {
        List<Company> approvedCompanies = companyRepository.findAllByStatus(CompanyStatus.APPROVED);

        if (approvedCompanies.isEmpty()) {
            log.warn("No approved companies found - cannot calculate estimates");
            return;
        }

        log.info("Calculating estimates for {} approved companies", approvedCompanies.size());

        for (Company company : approvedCompanies) {
            try {
                calculateEstimateUseCase.execute(company.id(), offer.id());
                log.debug("Calculated estimate for company {} and offer {}", company.id(), offer.id());
            } catch (Exception e) {
                log.error("Failed to calculate estimate for company {}: {}", company.id(), e.getMessage());
                // Fehler bei einer Firma soll andere nicht blockieren
            }
        }

        log.info("Finished calculating estimates for offer {}", offer.id());
    }
}
