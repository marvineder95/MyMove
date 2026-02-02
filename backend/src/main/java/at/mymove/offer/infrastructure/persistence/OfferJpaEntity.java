package at.mymove.offer.infrastructure.persistence;

import at.mymove.offer.domain.OfferStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "offers")
public class OfferJpaEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status;

    @Column(name = "video_id", nullable = false)
    private UUID videoId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    protected OfferJpaEntity() {
        // JPA only
    }

    public OfferJpaEntity(
            UUID id,
            OfferStatus status,
            UUID videoId,
            Instant createdAt,
            Instant sentAt
    ) {
        this.id = id;
        this.status = status;
        this.videoId = videoId;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
    }

    public UUID getId() {
        return id;
    }

    public OfferStatus getStatus() {
        return status;
    }

    public UUID getVideoId() {
        return videoId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getSentAt() {
        return sentAt;
    }
}