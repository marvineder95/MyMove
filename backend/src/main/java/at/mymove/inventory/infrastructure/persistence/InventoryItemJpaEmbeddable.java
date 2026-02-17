package at.mymove.inventory.infrastructure.persistence;

import at.mymove.inventory.domain.ItemSource;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Embeddable JPA-Klasse für ein InventoryItem.
 * Wird in InventoryListJpaEntity als ElementCollection gespeichert.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemJpaEmbeddable {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int quantity;

    @Column
    private Double confidence;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemSource source;

    @Column
    private String category;

    @Column
    private Double volume;
}
