package at.mymove.offer.infrastructure.persistence;

import at.mymove.offer.domain.Offer;

/**
 * Mapper zwischen Offer Domain und JPA Entity.
 */
final class OfferMapper {

    private OfferMapper() {}

    static OfferJpaEntity toJpa(Offer offer) {
        if (offer == null) return null;

        return new OfferJpaEntity(
                offer.id(),
                offer.status(),
                offer.videoId(),
                offer.inventoryId(),
                offer.companyId(),
                offer.moveDetails(),
                offer.createdAt(),
                offer.updatedAt(),
                offer.sentAt(),
                offer.expiresAt()
        );
    }

    static Offer toDomain(OfferJpaEntity entity) {
        if (entity == null) return null;

        return new Offer(
                entity.getId(),
                entity.getStatus(),
                entity.getVideoId(),
                entity.getInventoryId(),
                entity.getCompanyId(),
                entity.getMoveDetails(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getSentAt(),
                entity.getExpiresAt()
        );
    }
}
