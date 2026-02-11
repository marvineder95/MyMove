package at.mymove.offer.infrastructure.persistence;

import at.mymove.offer.domain.Offer;

final class OfferMapper {

    private OfferMapper() {}

    static OfferJpaEntity toJpa(Offer offer) {
        return new OfferJpaEntity(
                offer.id(),
                offer.status(),
                offer.videoId(),
                offer.companyId(),
                offer.moveDetails(),
                offer.createdAt(),
                offer.sentAt()
        );
    }

    static Offer toDomain(OfferJpaEntity entity) {
        return new Offer(
                entity.getId(),
                entity.getStatus(),
                entity.getVideoId(),
                entity.getCompanyId(),
                entity.getMoveDetails(),
                entity.getCreatedAt(),
                entity.getSentAt()
        );
    }
}