package at.mymove.offer.infrastructure.persistence;

import at.mymove.move.domain.MoveDetails;
import at.mymove.offer.domain.OfferStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Entity
@Table(name = "offers")
public class OfferJpaEntity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    private OfferStatus status;

    private UUID videoId;

    @Convert(converter = MoveDetailsJsonConverter.class)
    @Column(name = "move_details", columnDefinition = "LONGTEXT")
    private MoveDetails moveDetails;

    private Instant createdAt;

    private Instant sentAt;

    protected OfferJpaEntity() {}

    public OfferJpaEntity(
            UUID id,
            OfferStatus status,
            UUID videoId,
            MoveDetails moveDetails,
            Instant createdAt,
            Instant sentAt
    ) {
        this.id = id;
        this.status = status;
        this.videoId = videoId;
        this.moveDetails = moveDetails;
        this.createdAt = createdAt;
        this.sentAt = sentAt;
    }
}