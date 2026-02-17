package at.mymove.ai.infrastructure.client;

import at.mymove.ai.domain.DetectedItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Mock-Implementierung des AiServiceClient für Entwicklung und Testing.
 *
 * Simuliert die AI-Analyse mit zufälligen Verzögerungen und Dummy-Daten.
 * Keine echte KI - perfekt zum Testen des Backends ohne Python-Service!
 */
@Slf4j
@Component
@Profile({"dev", "test", "mock-ai"})
public class AiServiceClientMock implements AiServiceClient {

    private final Map<String, MockJob> jobs = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    // Vorgefertigte Dummy-Erkennungen für realistische Testdaten
    private static final DetectedItemResponse[] SAMPLE_ITEMS = {
            new DetectedItemResponse("sofa", "3-seater grey fabric sofa", 0.94, null, 2.8, 1),
            new DetectedItemResponse("dining_table", "wooden dining table for 6 people", 0.89, null, 1.5, 1),
            new DetectedItemResponse("chair", "dining chair with leather seat", 0.92, null, 0.3, 6),
            new DetectedItemResponse("tv", "55-inch flatscreen TV", 0.96, null, 0.2, 1),
            new DetectedItemResponse("tv_stand", "black TV stand with shelves", 0.87, null, 0.8, 1),
            new DetectedItemResponse("bookshelf", "white IKEA Billy bookcase", 0.91, null, 0.5, 2),
            new DetectedItemResponse("bed", "queen-size bed with frame", 0.93, null, 3.2, 1),
            new DetectedItemResponse("wardrobe", "2-door wooden wardrobe", 0.88, null, 1.8, 2),
            new DetectedItemResponse("desk", "office desk with drawers", 0.85, null, 0.9, 1),
            new DetectedItemResponse("box", "cardboard moving box", 0.82, null, 0.06, 12),
            new DetectedItemResponse("lamp", "floor lamp with white shade", 0.79, null, 0.15, 3),
            new DetectedItemResponse("fridge", "standard refrigerator", 0.94, null, 1.2, 1),
            new DetectedItemResponse("washing_machine", "front-loading washing machine", 0.91, null, 0.4, 1)
    };

    @Override
    public String submitAnalysisJob(UUID videoId, String videoUrl) {
        String jobId = videoId.toString();
        log.info("[MOCK] Submitting analysis job for video: {}", videoId);

        MockJob job = new MockJob(jobId, videoUrl, System.currentTimeMillis());
        jobs.put(jobId, job);

        // Simuliere Analyse nach 2-5 Sekunden
        int delaySeconds = 2 + (int) (Math.random() * 3);
        scheduler.schedule(() -> completeJob(jobId), delaySeconds, TimeUnit.SECONDS);

        log.info("[MOCK] Job {} submitted, will complete in {} seconds", jobId, delaySeconds);
        return jobId;
    }

    @Override
    public AnalysisJobStatusResponse getJobStatus(String externalJobId) {
        MockJob job = jobs.get(externalJobId);
        if (job == null) {
            log.warn("[MOCK] Job {} not found", externalJobId);
            return null;
        }

        return new AnalysisJobStatusResponse(
                externalJobId,
                job.status,
                job.errorMessage
        );
    }

    @Override
    public AnalysisResultResponse getJobResult(String externalJobId) {
        MockJob job = jobs.get(externalJobId);
        if (job == null || !"succeeded".equals(job.status)) {
            return null;
        }

        return job.result;
    }

    @Override
    public boolean cancelJob(String externalJobId) {
        MockJob job = jobs.get(externalJobId);
        if (job == null) {
            return false;
        }
        job.status = "failed";
        job.errorMessage = "Cancelled by user";
        log.info("[MOCK] Job {} cancelled", externalJobId);
        return true;
    }

    @Override
    public boolean isHealthy() {
        return true; // Mock ist immer healthy
    }

    private void completeJob(String jobId) {
        MockJob job = jobs.get(jobId);
        if (job == null) return;

        // 10% Chance auf Fehler für Testing
        if (Math.random() < 0.1) {
            job.status = "failed";
            job.errorMessage = "Simulated processing error";
            log.info("[MOCK] Job {} failed (simulated)", jobId);
            return;
        }

        // Zufällige Auswahl von 5-10 Items
        int itemCount = 5 + (int) (Math.random() * 6);
        DetectedItemResponse[] items = new DetectedItemResponse[itemCount];
        double totalVolume = 0;

        for (int i = 0; i < itemCount; i++) {
            DetectedItemResponse sample = SAMPLE_ITEMS[(int) (Math.random() * SAMPLE_ITEMS.length)];
            // Leichte Variationen für Realismus
            int quantity = sample.quantity() + (int) (Math.random() * 2);
            double confidence = Math.min(0.99, sample.confidence() + (Math.random() * 0.05 - 0.025));
            items[i] = new DetectedItemResponse(
                    sample.label(),
                    sample.description(),
                    confidence,
                    sample.boundingBox(),
                    sample.estimatedVolumeM3(),
                    quantity
            );
            totalVolume += sample.estimatedVolumeM3() * quantity;
        }

        job.status = "succeeded";
        job.result = new AnalysisResultResponse(
                jobId,
                items,
                totalVolume,
                "living_room",
                (System.currentTimeMillis() - job.startTime) / 1000.0
        );

        log.info("[MOCK] Job {} completed with {} items, {} m³",
                jobId, itemCount, String.format("%.2f", totalVolume));
    }

    private static class MockJob {
        final String jobId;
        final String videoUrl;
        final long startTime;
        volatile String status = "pending";
        volatile String errorMessage;
        volatile AnalysisResultResponse result;

        MockJob(String jobId, String videoUrl, long startTime) {
            this.jobId = jobId;
            this.videoUrl = videoUrl;
            this.startTime = startTime;
        }
    }
}
