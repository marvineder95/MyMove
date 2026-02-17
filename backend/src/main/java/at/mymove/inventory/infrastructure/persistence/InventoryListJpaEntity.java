package at.mymove.inventory.infrastructure.persistence;

import at.mymove.inventory.domain.InventoryStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JPA Entity für InventoryList.
 */
@Entity
@Table(name = "inventory_lists")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class InventoryListJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID offerId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "inventory_items",
            joinColumns = @JoinColumn(name = "inventory_list_id")
    )
    @OrderColumn(name = "item_order")
    @Builder.Default
    private List<InventoryItemJpaEmbeddable> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InventoryStatus status = InventoryStatus.DRAFT;

    @Column(nullable = false)
    private Instant createdAt;

    @Column
    private Instant confirmedAt;

    @Column(nullable = false)
    @Builder.Default
    private double totalVolume = 0.0;

    @PrePersist
    void prePersist() {
        if (status == null) {
            status = InventoryStatus.DRAFT;
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (items == null) {
            items = new ArrayList<>();
        }
    }
}
