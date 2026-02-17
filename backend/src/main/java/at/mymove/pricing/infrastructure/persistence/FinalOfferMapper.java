package at.mymove.pricing.infrastructure.persistence;

import at.mymove.pricing.domain.FinalOffer;
import org.springframework.stereotype.Component;

/**
 * Mapper zwischen FinalOffer Domain und JPA Entity.
 */
@Component
public class FinalOfferMapper {

    public FinalOfferJpaEntity toJpaEntity(FinalOffer domain) {
        if (domain == null) return null;

        return FinalOfferJpaEntity.builder()
                .id(domain.id())
                .offerId(domain.offerId())
                .companyId(domain.companyId())
                .priceEstimateId(domain.priceEstimateId())
                .totalPrice(domain.totalPrice())
                .breakdown(domain.breakdown())
                .validityDays(domain.validityDays())
                .notes(domain.notes())
                .status(domain.status())
                .createdAt(domain.createdAt())
                .submittedAt(domain.submittedAt())
                .acceptedAt(domain.acceptedAt())
                .rejectedAt(domain.rejectedAt())
                .rejectionReason(domain.rejectionReason())
                .build();
    }

    public FinalOffer toDomainEntity(FinalOfferJpaEntity jpa) {
        if (jpa == null) return null;

        return new FinalOffer(
                jpa.getId(),
                jpa.getOfferId(),
                jpa.getCompanyId(),
                jpa.getPriceEstimateId(),
                jpa.getTotalPrice(),
                jpa.getBreakdown(),
                jpa.getValidityDays(),
                jpa.getNotes(),
                jpa.getStatus(),
                jpa.getCreatedAt(),
                jpa.getSubmittedAt(),
                jpa.getAcceptedAt(),
                jpa.getRejectedAt(),
                jpa.getRejectionReason()
        );
    }
}
