package at.mymove.pricing.infrastructure.persistence;

import at.mymove.pricing.domain.PriceEstimate;
import org.springframework.stereotype.Component;

/**
 * Mapper zwischen PriceEstimate Domain und JPA Entity.
 */
@Component
public class PriceEstimateMapper {

    public PriceEstimateJpaEntity toJpaEntity(PriceEstimate domain) {
        if (domain == null) return null;

        return PriceEstimateJpaEntity.builder()
                .id(domain.id())
                .offerId(domain.offerId())
                .companyId(domain.companyId())
                .totalPrice(domain.totalPrice())
                .priceRangeLow(domain.priceRangeLow())
                .priceRangeHigh(domain.priceRangeHigh())
                .breakdown(domain.breakdown())
                .estimatedHours(domain.estimatedHours())
                .estimatedVolume(domain.estimatedVolume())
                .currency(domain.currency())
                .calculatedAt(domain.calculatedAt())
                .validUntil(domain.validUntil())
                .build();
    }

    public PriceEstimate toDomainEntity(PriceEstimateJpaEntity jpa) {
        if (jpa == null) return null;

        return new PriceEstimate(
                jpa.getId(),
                jpa.getOfferId(),
                jpa.getCompanyId(),
                jpa.getTotalPrice(),
                jpa.getPriceRangeLow(),
                jpa.getPriceRangeHigh(),
                jpa.getBreakdown(),
                jpa.getEstimatedHours(),
                jpa.getEstimatedVolume(),
                jpa.getCurrency(),
                jpa.getCalculatedAt(),
                jpa.getValidUntil()
        );
    }
}
