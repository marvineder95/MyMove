package at.mymove.inventory.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA Repository für InventoryListJpaEntity.
 */
@Repository
public interface InventoryListJpaRepository extends JpaRepository<InventoryListJpaEntity, UUID> {

    Optional<InventoryListJpaEntity> findByOfferId(UUID offerId);

    boolean existsByOfferId(UUID offerId);
}
