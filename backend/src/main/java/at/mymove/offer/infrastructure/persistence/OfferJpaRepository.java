package at.mymove.offer.infrastructure.persistence;

import at.mymove.offer.domain.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA Repository für OfferJpaEntity.
 */
public interface OfferJpaRepository extends JpaRepository<OfferJpaEntity, UUID> {

    List<OfferJpaEntity> findAllByCompanyId(UUID companyId);

    Optional<OfferJpaEntity> findByIdAndCompanyId(UUID id, UUID companyId);

    List<OfferJpaEntity> findByStatusIn(List<OfferStatus> statuses);

    List<OfferJpaEntity> findByStatus(OfferStatus status);
}
