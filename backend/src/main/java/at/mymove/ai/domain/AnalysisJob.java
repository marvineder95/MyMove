package at.mymove.ai.domain;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Aggregate Root für einen Video-Analyse-Job.
 *
 * Repräsentiert den kompletten Lebenszyklus einer KI-Analyse
 * von der Erstellung bis zum Ergebnis.
 *
 * @param id              Eindeutige Job-ID
 * @param videoId         Referenz zum Video
 * @param offerId         Referenz zum Offer (optional bis zur Verknüpfung)
 * @param status          Aktueller Status
 * @param detectedItems   Erkannte Items (nur bei SUCCEEDED)
 * @param errorMessage    Fehlermeldung (nur bei FAILED)
 * @param totalVolumeM3   Gesamtvolumen (nur bei SUCCEEDED)
 * @param roomType        Erkannter Raumtyp (nur bei SUCCEEDED)
 * @param processingTimeSeconds  Dauer der Analyse
 * @param createdAt       Erstellungszeitpunkt
 * @param startedAt       Startzeitpunkt (null bis zum Start)
 * @param completedAt     Abschlusszeitpunkt (null bis zum Abschluss)
 * @param retryCount      Anzahl der Wiederholungsversuche
 */
public record AnalysisJob(
        UUID id,
        UUID videoId,
        UUID offerId,
        AnalysisJobStatus status,
        List<DetectedItem> detectedItems,
        String errorMessage,
        Double totalVolumeM3,
        String roomType,
        Double processingTimeSeconds,
        Instant createdAt,
        Instant startedAt,
        Instant completedAt,
        int retryCount
) {

    public AnalysisJob {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (videoId == null) throw new IllegalArgumentException("videoId is required");
        if (status == null) throw new IllegalArgumentException("status is required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");

        // Status-Invarianten
        validateStatusInvariants(status, startedAt, completedAt, detectedItems, errorMessage);

        detectedItems = detectedItems != null ? List.copyOf(detectedItems) : List.of();
        if (retryCount < 0) retryCount = 0;
    }

    private static void validateStatusInvariants(
            AnalysisJobStatus status,
            Instant startedAt,
            Instant completedAt,
            List<DetectedItem> detectedItems,
            String errorMessage
    ) {
        switch (status) {
            case PENDING -> {
                if (startedAt != null) throw new IllegalArgumentException("startedAt must be null when status is PENDING");
                if (completedAt != null) throw new IllegalArgumentException("completedAt must be null when status is PENDING");
                if (detectedItems != null && !detectedItems.isEmpty())
                    throw new IllegalArgumentException("detectedItems must be empty when status is PENDING");
                if (errorMessage != null) throw new IllegalArgumentException("errorMessage must be null when status is PENDING");
            }
            case RUNNING -> {
                if (startedAt == null) throw new IllegalArgumentException("startedAt is required when status is RUNNING");
                if (completedAt != null) throw new IllegalArgumentException("completedAt must be null when status is RUNNING");
                if (detectedItems != null && !detectedItems.isEmpty())
                    throw new IllegalArgumentException("detectedItems must be empty when status is RUNNING");
                if (errorMessage != null) throw new IllegalArgumentException("errorMessage must be null when status is RUNNING");
            }
            case SUCCEEDED -> {
                if (startedAt == null) throw new IllegalArgumentException("startedAt is required when status is SUCCEEDED");
                if (completedAt == null) throw new IllegalArgumentException("completedAt is required when status is SUCCEEDED");
                if (errorMessage != null) throw new IllegalArgumentException("errorMessage must be null when status is SUCCEEDED");
            }
            case FAILED -> {
                if (startedAt == null) throw new IllegalArgumentException("startedAt is required when status is FAILED");
                if (completedAt == null) throw new IllegalArgumentException("completedAt is required when status is FAILED");
                if (detectedItems != null && !detectedItems.isEmpty())
                    throw new IllegalArgumentException("detectedItems must be empty when status is FAILED");
            }
        }
    }

    /**
     * Factory-Methode: Erstellt einen neuen Job.
     */
    public static AnalysisJob create(UUID videoId) {
        return new AnalysisJob(
                UUID.randomUUID(),
                videoId,
                null,
                AnalysisJobStatus.PENDING,
                null,
                null,
                null,
                null,
                null,
                Instant.now(),
                null,
                null,
                0
        );
    }

    /**
     * Startet den Job.
     */
    public AnalysisJob start(Instant now) {
        if (status != AnalysisJobStatus.PENDING) {
            throw new IllegalStateException("Only PENDING jobs can be started");
        }
        if (now == null) throw new IllegalArgumentException("now is required");

        return new AnalysisJob(
                id,
                videoId,
                offerId,
                AnalysisJobStatus.RUNNING,
                null,
                null,
                null,
                null,
                null,
                createdAt,
                now,
                null,
                retryCount
        );
    }

    /**
     * Markiert den Job als erfolgreich abgeschlossen.
     */
    public AnalysisJob completeSuccess(
            List<DetectedItem> items,
            Double totalVolume,
            String room,
            Double processingTime,
            Instant now
    ) {
        if (status != AnalysisJobStatus.RUNNING) {
            throw new IllegalStateException("Only RUNNING jobs can be completed");
        }
        if (now == null) throw new IllegalArgumentException("now is required");
        if (items == null) throw new IllegalArgumentException("items is required");

        return new AnalysisJob(
                id,
                videoId,
                offerId,
                AnalysisJobStatus.SUCCEEDED,
                items,
                null,
                totalVolume,
                room,
                processingTime,
                createdAt,
                startedAt,
                now,
                retryCount
        );
    }

    /**
     * Markiert den Job als fehlgeschlagen.
     */
    public AnalysisJob completeFailure(String error, Instant now) {
        if (status != AnalysisJobStatus.RUNNING && status != AnalysisJobStatus.PENDING) {
            throw new IllegalStateException("Only RUNNING or PENDING jobs can fail");
        }
        if (now == null) throw new IllegalArgumentException("now is required");
        if (error == null || error.isBlank()) throw new IllegalArgumentException("error is required");

        return new AnalysisJob(
                id,
                videoId,
                offerId,
                AnalysisJobStatus.FAILED,
                null,
                error,
                null,
                null,
                null,
                createdAt,
                startedAt,
                now,
                retryCount
        );
    }

    /**
     * Verknüpft den Job mit einem Offer.
     */
    public AnalysisJob attachToOffer(UUID offerId) {
        if (this.offerId != null) {
            throw new IllegalStateException("Job is already attached to an offer");
        }
        return new AnalysisJob(
                id,
                videoId,
                offerId,
                status,
                detectedItems,
                errorMessage,
                totalVolumeM3,
                roomType,
                processingTimeSeconds,
                createdAt,
                startedAt,
                completedAt,
                retryCount
        );
    }

    /**
     * Erhöht den Retry-Zähler für einen neuen Versuch.
     */
    public AnalysisJob incrementRetry() {
        return new AnalysisJob(
                id,
                videoId,
                offerId,
                AnalysisJobStatus.PENDING,
                null,
                null,
                null,
                null,
                null,
                createdAt,
                null,
                null,
                retryCount + 1
        );
    }

    /**
     * Prüft ob der Job abgeschlossen ist (egal ob Erfolg oder Fehler).
     */
    public boolean isCompleted() {
        return status == AnalysisJobStatus.SUCCEEDED || status == AnalysisJobStatus.FAILED;
    }

    /**
     * Prüft ob ein Retry möglich ist.
     */
    public boolean canRetry(int maxRetries) {
        return status == AnalysisJobStatus.FAILED && retryCount < maxRetries;
    }

    /**
     * Konvertiert die erkannten Items zu InventoryItems.
     */
    public List<at.mymove.inventory.domain.InventoryItem> toInventoryItems() {
        if (status != AnalysisJobStatus.SUCCEEDED || detectedItems == null) {
            return List.of();
        }
        return detectedItems.stream()
                .map(DetectedItem::toInventoryItem)
                .toList();
    }
}
