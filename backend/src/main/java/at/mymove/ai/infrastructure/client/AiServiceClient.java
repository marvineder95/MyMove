package at.mymove.ai.infrastructure.client;

import at.mymove.ai.domain.AnalysisJob;

import java.util.UUID;

/**
 * Client Interface für den AI-Service.
 *
 * Definiert den Vertrag für die Kommunikation mit dem Python/FastAPI Service.
 * Implementierungen können real (HTTP) oder mock sein.
 */
public interface AiServiceClient {

    /**
     * Startet eine Video-Analyse beim AI-Service.
     *
     * @param videoId ID des Videos
     * @param videoUrl URL oder Pfad zum Video
     * @return Die Job-ID beim AI-Service (kann gleich videoId sein)
     */
    String submitAnalysisJob(UUID videoId, String videoUrl);

    /**
     * Ruft den Status eines Jobs beim AI-Service ab.
     *
     * @param externalJobId Externe Job-ID
     * @return Aktueller Status oder null wenn nicht gefunden
     */
    AnalysisJobStatusResponse getJobStatus(String externalJobId);

    /**
     * Ruft das Ergebnis eines abgeschlossenen Jobs ab.
     *
     * @param externalJobId Externe Job-ID
     * @return Ergebnis oder null wenn nicht fertig
     */
    AnalysisResultResponse getJobResult(String externalJobId);

    /**
     * Bricht einen laufenden Job ab.
     *
     * @param externalJobId Externe Job-ID
     * @return true wenn erfolgreich abgebrochen
     */
    boolean cancelJob(String externalJobId);

    /**
     * Prüft ob der AI-Service erreichbar ist.
     *
     * @return true wenn Service healthy
     */
    boolean isHealthy();

    // ---- Response DTOs ----

    record AnalysisJobStatusResponse(
            String jobId,
            String status,  // "pending", "running", "succeeded", "failed"
            String errorMessage
    ) {}

    record AnalysisResultResponse(
            String jobId,
            DetectedItemResponse[] detectedItems,
            Double totalVolumeM3,
            String roomType,
            Double processingTimeSeconds
    ) {}

    record DetectedItemResponse(
            String label,
            String description,
            double confidence,
            BoundingBoxResponse boundingBox,
            Double estimatedVolumeM3,
            int quantity
    ) {}

    record BoundingBoxResponse(
            int x,
            int y,
            int width,
            int height
    ) {}
}
