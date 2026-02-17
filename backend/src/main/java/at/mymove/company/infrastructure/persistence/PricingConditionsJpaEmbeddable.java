package at.mymove.company.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Embeddable JPA-Klasse für PricingConditions.
 * Wird in CompanyJpaEntity eingebettet gespeichert.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PricingConditionsJpaEmbeddable {

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal travelFee;

    @Column(precision = 10, scale = 2)
    private BigDecimal baseFee;

    @Column(precision = 5, scale = 2)
    private BigDecimal extraChargePercent;

    @Column(precision = 10, scale = 2)
    private BigDecimal minimumPrice;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";
}
