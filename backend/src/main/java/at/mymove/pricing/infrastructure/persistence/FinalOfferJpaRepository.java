package at.mymove.pricing.infrastructure.persistence;

import at.mymove.pricing.domain.FinalOfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA Repository für FinalOfferJpaEntity.
 */
@Repository
public interface FinalOfferJpaRepository extends JpaRepository<FinalOfferJpaEntity, UUID> {

    List<FinalOfferJpaEntity> findByOfferId(UUID offerId);

    List<FinalOfferJpaEntity> findByCompanyId(UUID companyId);

    Optional<FinalOfferJpaEntity> findByCompanyIdAndOfferId(UUID companyId, UUID offerId);

    List<FinalOfferJpaEntity> findByStatus(FinalOfferStatus status);
}
