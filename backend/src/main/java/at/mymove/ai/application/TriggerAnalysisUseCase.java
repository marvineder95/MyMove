package at.mymove.ai.application;

import at.mymove.ai.domain.AnalysisJob;
import at.mymove.ai.infrastructure.client.AiServiceClient;
import at.mymove.video.application.VideoRepository;
import at.mymove.video.domain.Video;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Use Case: Startet eine Video-Analyse beim AI-Service.
 *
 * Dies ist der Entry-Point für die KI-Analyse. Der Use Case:
 * 1. Prüft ob das Video existiert
 * 2. Erstellt einen AnalysisJob
 * 3. Schickt den Job an den AI-Service
 * 4. Speichert den Job mit externer ID
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TriggerAnalysisUseCase {

    private final AnalysisJobRepository analysisJobRepository;
    private final VideoRepository videoRepository;
    private final AiServiceClient aiServiceClient;

    /**
     * Startet die Analyse für ein Video.
     *
     * @param videoId ID des Videos
     * @return Der erstellte AnalysisJob
     */
    @Transactional
    public AnalysisJob execute(UUID videoId) {
        if (videoId == null) {
            throw new IllegalArgumentException("videoId is required");
        }

        // Video prüfen
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found: " + videoId));

        // Prüfen ob bereits ein Job läuft
        var existingJobs = analysisJobRepository.findByVideoId(videoId);
        for (var job : existingJobs) {
            if (!job.isCompleted()) {
                log.info("Analysis already in progress for video {}, returning existing job {}",
                        videoId, job.id());
                return job;
            }
        }

        // Neuen Job erstellen
        AnalysisJob job = AnalysisJob.create(videoId);
        job = analysisJobRepository.save(job);
        log.info("Created analysis job {} for video {}", job.id(), videoId);

        // Video-URL bauen (für den AI-Service)
        // In Produktion: echte URL oder temporärer Download-Link
        String videoUrl = buildVideoUrl(video);

        // An AI-Service senden
        try {
            String externalJobId = aiServiceClient.submitAnalysisJob(videoId, videoUrl);
            log.info("Submitted job {} to AI-Service, external ID: {}", job.id(), externalJobId);

            // Job auf RUNNING setzen
            job = job.start(java.time.Instant.now());
            job = analysisJobRepository.save(job);

        } catch (Exception e) {
            log.error("Failed to submit job to AI-Service: {}", e.getMessage());
            job = job.completeFailure("Failed to connect to AI-Service: " + e.getMessage(),
                    java.time.Instant.now());
            job = analysisJobRepository.save(job);
        }

        return job;
    }

    /**
     * Startet die Analyse und verknüpft sie direkt mit einem Offer.
     */
    @Transactional
    public AnalysisJob executeForOffer(UUID videoId, UUID offerId) {
        AnalysisJob job = execute(videoId);

        if (offerId != null && job.offerId() == null) {
            job = job.attachToOffer(offerId);
            job = analysisJobRepository.save(job);
            log.info("Attached analysis job {} to offer {}", job.id(), offerId);
        }

        return job;
    }

    private String buildVideoUrl(Video video) {
        // Mock: Lokaler Pfad oder URL
        // In Produktion: Presigned URL oder interner Storage-Link
        return "/videos/" + video.id();
    }
}
