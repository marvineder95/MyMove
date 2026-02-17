package at.mymove.inventory.infrastructure.persistence;

import at.mymove.inventory.domain.InventoryItem;
import at.mymove.inventory.domain.InventoryList;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper zwischen InventoryList Domain und JPA Entity.
 */
@Component
public class InventoryMapper {

    /**
     * Wandelt eine Domain-Entity in eine JPA-Entity um.
     */
    public InventoryListJpaEntity toJpaEntity(InventoryList domain) {
        if (domain == null) {
            return null;
        }

        List<InventoryItemJpaEmbeddable> jpaItems = domain.items().stream()
                .map(this::toJpaEmbeddable)
                .toList();

        return InventoryListJpaEntity.builder()
                .id(domain.id())
                .offerId(domain.offerId())
                .items(jpaItems)
                .status(domain.status())
                .createdAt(domain.createdAt())
                .confirmedAt(domain.confirmedAt())
                .totalVolume(domain.totalVolume())
                .build();
    }

    /**
     * Wandelt eine JPA-Entity in eine Domain-Entity um.
     */
    public InventoryList toDomainEntity(InventoryListJpaEntity jpa) {
        if (jpa == null) {
            return null;
        }

        List<InventoryItem> domainItems = jpa.getItems().stream()
                .map(this::toDomainItem)
                .toList();

        return new InventoryList(
                jpa.getId(),
                jpa.getOfferId(),
                domainItems,
                jpa.getStatus(),
                jpa.getCreatedAt(),
                jpa.getConfirmedAt(),
                jpa.getTotalVolume()
        );
    }

    /**
     * Wandelt ein Domain-Item in ein JPA-Embeddable um.
     */
    private InventoryItemJpaEmbeddable toJpaEmbeddable(InventoryItem item) {
        return new InventoryItemJpaEmbeddable(
                item.name(),
                item.quantity(),
                item.confidence(),
                item.source(),
                item.category(),
                item.volume()
        );
    }

    /**
     * Wandelt ein JPA-Embeddable in ein Domain-Item um.
     */
    private InventoryItem toDomainItem(InventoryItemJpaEmbeddable jpa) {
        return new InventoryItem(
                jpa.getName(),
                jpa.getQuantity(),
                jpa.getConfidence(),
                jpa.getSource(),
                jpa.getCategory(),
                jpa.getVolume()
        );
    }
}
