package at.mymove.ai.application;

import at.mymove.ai.domain.AnalysisJob;
import at.mymove.ai.domain.AnalysisJobStatus;
import at.mymove.ai.infrastructure.client.AiServiceClient;
import at.mymove.ai.infrastructure.client.AiServiceClient.AnalysisJobStatusResponse;
import at.mymove.ai.infrastructure.client.AiServiceClient.AnalysisResultResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Use Case: Prüft den Status eines AnalysisJob beim AI-Service.
 *
 * Dieser Use Case polled den AI-Service und aktualisiert den lokalen Job-Status.
 * Wird typischerweise vom Frontend oder einem Scheduler aufgerufen.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CheckAnalysisStatusUseCase {

    private final AnalysisJobRepository analysisJobRepository;
    private final AiServiceClient aiServiceClient;

    /**
     * Prüft und aktualisiert den Status eines Jobs.
     *
     * @param jobId ID des AnalysisJob
     * @return Der aktualisierte Job
     */
    @Transactional
    public AnalysisJob execute(UUID jobId) {
        if (jobId == null) {
            throw new IllegalArgumentException("jobId is required");
        }

        AnalysisJob job = analysisJobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("AnalysisJob not found: " + jobId));

        // Abgeschlossene Jobs nicht mehr prüfen
        if (job.isCompleted()) {
            log.debug("Job {} is already completed with status {}", jobId, job.status());
            return job;
        }

        // Bei PENDING: Noch nicht beim AI-Service angekommen?
        if (job.status() == AnalysisJobStatus.PENDING) {
            log.debug("Job {} is still pending, waiting for AI-Service to start", jobId);
            return job;
        }

        // Status vom AI-Service holen
        // Für den Mock verwenden wir die jobId als externalJobId
        String externalJobId = job.id().toString();

        try {
            AnalysisJobStatusResponse statusResponse = aiServiceClient.getJobStatus(externalJobId);

            if (statusResponse == null) {
                log.warn("No status received for job {} from AI-Service", jobId);
                return job;
            }

            log.debug("Received status '{}' for job {}", statusResponse.status(), jobId);

            // Status mappen und aktualisieren
            return updateJobStatus(job, statusResponse);

        } catch (Exception e) {
            log.error("Failed to check status for job {}: {}", jobId, e.getMessage());
            return job;
        }
    }

    /**
     * Prüft alle laufenden Jobs (für Batch-Processing/Scheduler).
     */
    @Transactional
    public void checkAllRunningJobs() {
        var runningJobs = analysisJobRepository.findByStatus(AnalysisJobStatus.RUNNING);

        log.info("Checking status for {} running analysis jobs", runningJobs.size());

        for (AnalysisJob job : runningJobs) {
            try {
                execute(job.id());
            } catch (Exception e) {
                log.error("Error checking job {}: {}", job.id(), e.getMessage());
            }
        }
    }

    private AnalysisJob updateJobStatus(AnalysisJob job, AnalysisJobStatusResponse statusResponse) {
        return switch (statusResponse.status().toLowerCase()) {
            case "pending" -> {
                // Noch nicht gestartet - nichts tun
                yield job;
            }
            case "running" -> {
                // Läuft - nichts tun (startAt wurde bereits gesetzt)
                yield job;
            }
            case "succeeded" -> {
                // Erfolgreich - Ergebnis holen
                yield handleSuccess(job);
            }
            case "failed" -> {
                // Fehlgeschlagen
                yield handleFailure(job, statusResponse.errorMessage());
            }
            default -> {
                log.warn("Unknown status '{}' for job {}", statusResponse.status(), job.id());
                yield job;
            }
        };
    }

    private AnalysisJob handleSuccess(AnalysisJob job) {
        String externalJobId = job.id().toString();
        AnalysisResultResponse result = aiServiceClient.getJobResult(externalJobId);

        if (result == null) {
            log.warn("No result available for succeeded job {}", job.id());
            return job;
        }

        // Items mappen
        var items = java.util.Arrays.stream(result.detectedItems())
                .map(this::mapToDetectedItem)
                .toList();

        // Job als erfolgreich markieren
        AnalysisJob completedJob = job.completeSuccess(
                items,
                result.totalVolumeM3(),
                result.roomType(),
                result.processingTimeSeconds(),
                Instant.now()
        );

        completedJob = analysisJobRepository.save(completedJob);

        log.info("Job {} completed successfully with {} items, {} m³",
                job.id(), items.size(),
                result.totalVolumeM3() != null ? String.format("%.2f", result.totalVolumeM3()) : "unknown");

        return completedJob;
    }

    private AnalysisJob handleFailure(AnalysisJob job, String errorMessage) {
        String message = errorMessage != null ? errorMessage : "Analysis failed (unknown error)";

        AnalysisJob failedJob = job.completeFailure(message, Instant.now());
        failedJob = analysisJobRepository.save(failedJob);

        log.info("Job {} marked as failed: {}", job.id(), message);

        return failedJob;
    }

    private at.mymove.ai.domain.DetectedItem mapToDetectedItem(
            AiServiceClient.DetectedItemResponse response
    ) {
        at.mymove.ai.domain.BoundingBox bbox = null;
        if (response.boundingBox() != null) {
            bbox = new at.mymove.ai.domain.BoundingBox(
                    response.boundingBox().x(),
                    response.boundingBox().y(),
                    response.boundingBox().width(),
                    response.boundingBox().height()
            );
        }

        return new at.mymove.ai.domain.DetectedItem(
                response.label(),
                response.description(),
                response.confidence(),
                bbox,
                response.estimatedVolumeM3(),
                response.quantity()
        );
    }
}
