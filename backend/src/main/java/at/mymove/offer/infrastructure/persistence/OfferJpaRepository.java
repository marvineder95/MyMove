package at.mymove.offer.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OfferJpaRepository extends JpaRepository<OfferJpaEntity, UUID> {
}