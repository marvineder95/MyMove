package at.mymove.offer.infrastructure.persistence;

import at.mymove.move.domain.MoveDetails;
import at.mymove.offer.domain.OfferStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity für Offer.
 */
@Getter
@Setter
@Entity
@Table(name = "offers")
public class OfferJpaEntity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferStatus status;

    @Column(nullable = false)
    private UUID videoId;

    @Column
    private UUID inventoryId;

    @Column
    private UUID companyId;

    @Convert(converter = MoveDetailsJsonConverter.class)
    @Column(name = "move_details", nullable = false, columnDefinition = "LONGTEXT")
    private MoveDetails moveDetails;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Column
    private Instant sentAt;

    @Column
    private Instant expiresAt;

    protected OfferJpaEntity() {}

    public OfferJpaEntity(
            UUID id,
            OfferStatus status,
            UUID videoId,
            UUID inventoryId,
            UUID companyId,
            MoveDetails moveDetails,
            Instant createdAt,
            Instant updatedAt,
            Instant sentAt,
            Instant expiresAt
    ) {
        this.id = id;
        this.status = status;
        this.videoId = videoId;
        this.inventoryId = inventoryId;
        this.companyId = companyId;
        this.moveDetails = moveDetails;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.sentAt = sentAt;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
