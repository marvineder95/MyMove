package at.mymove.offer.infrastructure.persistence;

import at.mymove.offer.domain.OfferStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "offers")
public class OfferJpaEntity {

    @Id
    @Column(nullable = false, columnDefinition = "BINARY(16)")
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private OfferStatus status;

    @Column(nullable = false, columnDefinition = "BINARY(16)")
    private UUID videoId;

    @Lob
    @Column(nullable = false)
    private String moveDetailsJson;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant sentAt;

    protected OfferJpaEntity() {}

    public OfferJpaEntity(
            UUID id,
            OfferStatus status,
            UUID videoId,
            String moveDetailsJson,
            Instant createdAt,
            Instant sentAt
    ) {
        this.id = id;
        this.status = status;
        this.videoId = videoId;
        this.moveDetailsJson = moveDetailsJson;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
    }

    public UUID getId() { return id; }
    public OfferStatus getStatus() { return status; }
    public UUID getVideoId() { return videoId; }
    public String getMoveDetailsJson() { return moveDetailsJson; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getSentAt() { return sentAt; }
}