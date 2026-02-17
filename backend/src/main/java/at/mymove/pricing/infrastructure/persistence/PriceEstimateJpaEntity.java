package at.mymove.pricing.infrastructure.persistence;

import at.mymove.pricing.domain.PriceBreakdown;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * JPA Entity für PriceEstimate.
 */
@Entity
@Table(name = "price_estimates")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PriceEstimateJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID offerId;

    @Column(nullable = false)
    private UUID companyId;

    @Column(nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal totalPrice;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal priceRangeLow;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal priceRangeHigh;

    @Convert(converter = PriceBreakdownConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private PriceBreakdown breakdown;

    @Column(nullable = false)
    private double estimatedHours;

    @Column(nullable = false)
    private double estimatedVolume;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Column(nullable = false, updatable = false)
    private Instant calculatedAt;

    @Column
    private Instant validUntil;

    @PrePersist
    void prePersist() {
        if (currency == null) currency = "EUR";
        if (calculatedAt == null) calculatedAt = Instant.now();
    }
}
