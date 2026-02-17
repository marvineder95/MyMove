package at.mymove.ai.application;

import at.mymove.ai.domain.AnalysisJob;
import at.mymove.ai.domain.AnalysisJobStatus;
import at.mymove.inventory.application.CreateInventoryFromAiResultsUseCase;
import at.mymove.inventory.domain.InventoryItem;
import at.mymove.inventory.domain.InventoryList;
import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Use Case: Verarbeitet das Ergebnis einer erfolgreichen AI-Analyse.
 *
 * Wandelt die erkannten Items in eine InventoryList um und verknüpft
 * sie mit dem zugehörigen Offer.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProcessAnalysisResultUseCase {

    private final AnalysisJobRepository analysisJobRepository;
    private final CreateInventoryFromAiResultsUseCase createInventoryUseCase;
    private final OfferRepository offerRepository;

    /**
     * Verarbeitet ein abgeschlossenes AnalysisJob-Ergebnis.
     *
     * @param jobId ID des AnalysisJob
     * @return Die erstellte InventoryList
     */
    @Transactional
    public InventoryList execute(UUID jobId) {
        AnalysisJob job = analysisJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("AnalysisJob not found: " + jobId));

        if (job.status() != AnalysisJobStatus.SUCCEEDED) {
            throw new IllegalStateException("Can only process succeeded jobs, current status: " + job.status());
        }

        // Prüfen ob bereits verarbeitet
        if (job.offerId() != null) {
            // Prüfen ob bereits Inventory existiert
            Optional<Offer> existingOffer = offerRepository.findById(job.offerId());
            if (existingOffer.isPresent() && existingOffer.get().inventoryId() != null) {
                log.info("Inventory already exists for job {}, skipping", jobId);
                return null; // Oder Inventory laden und returnen
            }
        }

        // Items extrahieren
        List<InventoryItem> items = job.toInventoryItems();

        if (items.isEmpty()) {
            log.warn("No items detected in job {}, creating empty inventory", jobId);
        }

        // InventoryList erstellen
        UUID offerId = job.offerId();
        if (offerId == null) {
            throw new IllegalStateException("AnalysisJob has no offerId attached");
        }

        InventoryList inventory = createInventoryUseCase.execute(offerId, items);
        log.info("Created inventory {} with {} items from analysis job {}",
                inventory.id(), items.size(), jobId);

        return inventory;
    }

    /**
     * Verarbeitet alle abgeschlossenen Jobs, die noch keine Inventory haben.
     * Wird typischerweise von einem Scheduler aufgerufen.
     */
    @Transactional
    public void processAllCompletedJobs() {
        List<AnalysisJob> completedJobs = analysisJobRepository.findByStatus(AnalysisJobStatus.SUCCEEDED);

        log.info("Processing {} completed analysis jobs", completedJobs.size());

        for (AnalysisJob job : completedJobs) {
            try {
                // Prüfen ob bereits Inventory existiert
                if (job.offerId() == null) {
                    log.warn("Job {} has no offerId, skipping", job.id());
                    continue;
                }

                Optional<Offer> offerOpt = offerRepository.findById(job.offerId());
                if (offerOpt.isEmpty()) {
                    log.warn("Offer {} not found for job {}, skipping", job.offerId(), job.id());
                    continue;
                }

                Offer offer = offerOpt.get();
                if (offer.inventoryId() != null) {
                    // Bereits verarbeitet
                    continue;
                }

                // Verarbeiten
                execute(job.id());

            } catch (Exception e) {
                log.error("Error processing job {}: {}", job.id(), e.getMessage());
            }
        }
    }
}
