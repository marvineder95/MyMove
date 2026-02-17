package at.mymove.inventory.infrastructure.persistence;

import at.mymove.inventory.application.InventoryRepository;
import at.mymove.inventory.domain.InventoryList;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementierung des InventoryRepository Interface.
 * Adapter zwischen Domain Layer und JPA.
 */
@Repository
@RequiredArgsConstructor
public class InventoryRepositoryImpl implements InventoryRepository {

    private final InventoryListJpaRepository jpaRepository;
    private final InventoryMapper mapper;

    @Override
    public InventoryList save(InventoryList inventory) {
        InventoryListJpaEntity entity = mapper.toJpaEntity(inventory);
        InventoryListJpaEntity saved = jpaRepository.save(entity);
        return mapper.toDomainEntity(saved);
    }

    @Override
    public Optional<InventoryList> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(mapper::toDomainEntity);
    }

    @Override
    public Optional<InventoryList> findByOfferId(UUID offerId) {
        return jpaRepository.findByOfferId(offerId)
                .map(mapper::toDomainEntity);
    }

    @Override
    public boolean existsByOfferId(UUID offerId) {
        return jpaRepository.existsByOfferId(offerId);
    }

    @Override
    public void delete(InventoryList inventory) {
        jpaRepository.deleteById(inventory.id());
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }
}
