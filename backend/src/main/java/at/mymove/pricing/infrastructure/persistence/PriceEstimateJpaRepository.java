package at.mymove.pricing.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA Repository für PriceEstimateJpaEntity.
 */
@Repository
public interface PriceEstimateJpaRepository extends JpaRepository<PriceEstimateJpaEntity, UUID> {

    List<PriceEstimateJpaEntity> findByOfferId(UUID offerId);

    List<PriceEstimateJpaEntity> findByCompanyId(UUID companyId);

    Optional<PriceEstimateJpaEntity> findByCompanyIdAndOfferId(UUID companyId, UUID offerId);
}
