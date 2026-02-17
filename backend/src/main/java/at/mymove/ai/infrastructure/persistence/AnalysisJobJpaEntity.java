package at.mymove.ai.infrastructure.persistence;

import at.mymove.ai.domain.AnalysisJobStatus;
import at.mymove.ai.domain.DetectedItem;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * JPA Entity für AnalysisJob.
 */
@Entity
@Table(name = "analysis_jobs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class AnalysisJobJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID videoId;

    @Column
    private UUID offerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnalysisJobStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<DetectedItem> detectedItems;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column
    private Double totalVolumeM3;

    @Column
    private String roomType;

    @Column
    private Double processingTimeSeconds;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant startedAt;

    @Column
    private Instant completedAt;

    @Column(nullable = false)
    @Builder.Default
    private int retryCount = 0;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
