package at.mymove.offer.infrastructure.persistence;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferStatus;

import java.time.Instant;
import java.util.UUID;

final class OfferMapper {

    private OfferMapper() {
    }

    static OfferJpaEntity toJpa(Offer offer) {
        return new OfferJpaEntity(
                offer.id(),
                offer.status(),
                offer.videoId(),
                offer.createdAt(),
                offer.sentAt()
        );
    }

    static Offer toDomain(OfferJpaEntity entity) {
        return new Offer(
                entity.getId(),
                entity.getStatus(),
                entity.getVideoId(),
                entity.getCreatedAt(),
                entity.getSentAt()
        );
    }

    static Offer newDraft(UUID videoId) {
        return Offer.draft(videoId);
    }

    static Offer sent(Offer offer) {
        return offer.markSent(Instant.now());
    }

    static Offer readyToSend(Offer offer) {
        return offer.markReadyToSend();
    }

    static Offer failed(Offer offer) {
        return offer.markFailed();
    }
}