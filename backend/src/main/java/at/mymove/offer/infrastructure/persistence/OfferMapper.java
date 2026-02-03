package at.mymove.offer.infrastructure.persistence;

import at.mymove.move.domain.MoveDetails;
import at.mymove.offer.domain.Offer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

final class OfferMapper {

    private static final ObjectMapper MAPPER = new ObjectMapper().findAndRegisterModules();

    private OfferMapper() {}

    static OfferJpaEntity toJpa(Offer offer) {
        return new OfferJpaEntity(
                offer.id(),
                offer.status(),
                offer.videoId(),
                writeMoveDetails(offer.moveDetails()),
                offer.createdAt(),
                offer.sentAt()
        );
    }

    static Offer toDomain(OfferJpaEntity entity) {
        return new Offer(
                entity.getId(),
                entity.getStatus(),
                entity.getVideoId(),
                readMoveDetails(entity.getMoveDetailsJson()),
                entity.getCreatedAt(),
                entity.getSentAt()
        );
    }

    private static String writeMoveDetails(MoveDetails moveDetails) {
        try {
            return MAPPER.writeValueAsString(moveDetails);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialize MoveDetails", e);
        }
    }

    private static MoveDetails readMoveDetails(String json) {
        try {
            return MAPPER.readValue(json, MoveDetails.class);
        } catch (Exception e) {
            throw new IllegalStateException("Could not deserialize MoveDetails", e);
        }
    }
}