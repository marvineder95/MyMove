package at.mymove.ai.infrastructure.persistence;

import at.mymove.ai.domain.AnalysisJob;
import org.springframework.stereotype.Component;

/**
 * Mapper zwischen AnalysisJob Domain und JPA Entity.
 */
@Component
public class AnalysisJobMapper {

    public AnalysisJobJpaEntity toJpaEntity(AnalysisJob domain) {
        if (domain == null) return null;

        return AnalysisJobJpaEntity.builder()
                .id(domain.id())
                .videoId(domain.videoId())
                .offerId(domain.offerId())
                .status(domain.status())
                .detectedItems(domain.detectedItems())
                .errorMessage(domain.errorMessage())
                .totalVolumeM3(domain.totalVolumeM3())
                .roomType(domain.roomType())
                .processingTimeSeconds(domain.processingTimeSeconds())
                .createdAt(domain.createdAt())
                .startedAt(domain.startedAt())
                .completedAt(domain.completedAt())
                .retryCount(domain.retryCount())
                .build();
    }

    public AnalysisJob toDomainEntity(AnalysisJobJpaEntity jpa) {
        if (jpa == null) return null;

        return new AnalysisJob(
                jpa.getId(),
                jpa.getVideoId(),
                jpa.getOfferId(),
                jpa.getStatus(),
                jpa.getDetectedItems(),
                jpa.getErrorMessage(),
                jpa.getTotalVolumeM3(),
                jpa.getRoomType(),
                jpa.getProcessingTimeSeconds(),
                jpa.getCreatedAt(),
                jpa.getStartedAt(),
                jpa.getCompletedAt(),
                jpa.getRetryCount()
        );
    }
}
