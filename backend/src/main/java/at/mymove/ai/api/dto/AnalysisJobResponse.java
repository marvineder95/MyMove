package at.mymove.ai.api.dto;

import at.mymove.ai.domain.AnalysisJob;
import at.mymove.ai.domain.AnalysisJobStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO für AnalysisJob.
 */
public record AnalysisJobResponse(
        UUID id,
        UUID videoId,
        UUID offerId,
        AnalysisJobStatus status,
        List<DetectedItemResponse> detectedItems,
        String errorMessage,
        Double totalVolumeM3,
        String roomType,
        Double processingTimeSeconds,
        Instant createdAt,
        Instant startedAt,
        Instant completedAt,
        int retryCount,
        boolean isCompleted
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static AnalysisJobResponse from(AnalysisJob job) {
        List<DetectedItemResponse> items = job.detectedItems() != null
                ? job.detectedItems().stream()
                        .map(DetectedItemResponse::from)
                        .toList()
                : null;

        return new AnalysisJobResponse(
                job.id(),
                job.videoId(),
                job.offerId(),
                job.status(),
                items,
                job.errorMessage(),
                job.totalVolumeM3(),
                job.roomType(),
                job.processingTimeSeconds(),
                job.createdAt(),
                job.startedAt(),
                job.completedAt(),
                job.retryCount(),
                job.isCompleted()
        );
    }
}
