package at.mymove.ai.api;

import at.mymove.ai.api.dto.AnalysisJobResponse;
import at.mymove.ai.application.*;
import at.mymove.ai.domain.AnalysisJob;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller für AI-Analyse.
 *
 * Endpunkte:
 * - POST /api/v1/ai/analyze/{videoId}           - Analyse starten
 * - GET  /api/v1/ai/jobs/{jobId}                - Job-Status abfragen
 * - GET  /api/v1/ai/jobs/by-video/{videoId}     - Jobs für Video
 * - GET  /api/v1/ai/jobs/by-offer/{offerId}     - Job für Offer
 * - POST /api/v1/ai/jobs/{jobId}/check-status   - Status aktualisieren
 */
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final TriggerAnalysisUseCase triggerAnalysisUseCase;
    private final CheckAnalysisStatusUseCase checkAnalysisStatusUseCase;
    private final AnalysisJobRepository analysisJobRepository;

    /**
     * Startet eine Video-Analyse.
     */
    @PostMapping("/analyze/{videoId}")
    public ResponseEntity<AnalysisJobResponse> startAnalysis(
            @PathVariable String videoId,
            @RequestParam(required = false) String offerId
    ) {
        UUID videoUuid = parseUuid(videoId, "videoId");
        UUID offerUuid = offerId != null ? parseUuid(offerId, "offerId") : null;

        AnalysisJob job = triggerAnalysisUseCase.executeForOffer(videoUuid, offerUuid);
        return ResponseEntity.ok(AnalysisJobResponse.from(job));
    }

    /**
     * Holt einen AnalysisJob.
     */
    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<AnalysisJobResponse> getJob(@PathVariable String jobId) {
        UUID jobUuid = parseUuid(jobId, "jobId");

        AnalysisJob job = analysisJobRepository.findById(jobUuid)
                .orElseThrow(() -> new IllegalArgumentException("AnalysisJob not found: " + jobId));

        return ResponseEntity.ok(AnalysisJobResponse.from(job));
    }

    /**
     * Prüft und aktualisiert den Status eines Jobs.
     */
    @PostMapping("/jobs/{jobId}/check-status")
    public ResponseEntity<AnalysisJobResponse> checkStatus(@PathVariable String jobId) {
        UUID jobUuid = parseUuid(jobId, "jobId");

        AnalysisJob job = checkAnalysisStatusUseCase.execute(jobUuid);
        return ResponseEntity.ok(AnalysisJobResponse.from(job));
    }

    /**
     * Listet alle Jobs für ein Video.
     */
    @GetMapping("/jobs/by-video/{videoId}")
    public ResponseEntity<List<AnalysisJobResponse>> getJobsByVideo(@PathVariable String videoId) {
        UUID videoUuid = parseUuid(videoId, "videoId");

        List<AnalysisJobResponse> jobs = analysisJobRepository.findByVideoId(videoUuid)
                .stream()
                .map(AnalysisJobResponse::from)
                .toList();

        return ResponseEntity.ok(jobs);
    }

    /**
     * Holt den Job für ein Offer.
     */
    @GetMapping("/jobs/by-offer/{offerId}")
    public ResponseEntity<AnalysisJobResponse> getJobByOffer(@PathVariable String offerId) {
        UUID offerUuid = parseUuid(offerId, "offerId");

        AnalysisJob job = analysisJobRepository.findByOfferId(offerUuid)
                .orElseThrow(() -> new IllegalArgumentException("No analysis job found for offer: " + offerId));

        return ResponseEntity.ok(AnalysisJobResponse.from(job));
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
}
