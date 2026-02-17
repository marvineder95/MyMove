package at.mymove.pricing.infrastructure.persistence;

import at.mymove.pricing.domain.FinalOfferStatus;
import at.mymove.pricing.domain.PriceBreakdown;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity für FinalOffer.
 */
@Entity
@Table(name = "final_offers")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FinalOfferJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID offerId;

    @Column(nullable = false)
    private UUID companyId;

    @Column
    private UUID priceEstimateId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Convert(converter = PriceBreakdownConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private PriceBreakdown breakdown;

    @Column(nullable = false)
    private int validityDays;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FinalOfferStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column
    private Instant submittedAt;

    @Column
    private Instant acceptedAt;

    @Column
    private Instant rejectedAt;

    @Column
    private String rejectionReason;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
