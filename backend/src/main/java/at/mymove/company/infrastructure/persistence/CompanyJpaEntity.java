package at.mymove.company.infrastructure.persistence;

import at.mymove.company.domain.CompanyService;
import at.mymove.company.domain.CompanyStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * JPA Entity für Company.
 */
@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CompanyJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String addressLine;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String postalCode;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String phone;

    @Column
    private String website;

    @Column(nullable = false)
    private String atuNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "company_services",
            joinColumns = @JoinColumn(name = "company_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "service", nullable = false)
    @Builder.Default
    private Set<CompanyService> services = new HashSet<>();

    @Column(nullable = false)
    private String tradeLicenseFileRef;

    @Embedded
    private PricingConditionsJpaEmbeddable pricingConditions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CompanyStatus status = CompanyStatus.PENDING;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column
    private Instant reviewedAt;

    @Column
    private String reviewedByAdminEmail;

    @Column
    private String rejectionReason;

    @PrePersist
    void prePersist() {
        if (status == null) status = CompanyStatus.PENDING;
        if (createdAt == null) createdAt = Instant.now();
        if (services == null) services = new HashSet<>();
        if (atuNumber == null) atuNumber = "";
        if (pricingConditions == null) {
            // Fallback für Datenmigration - sollte in Produktion nie null sein
            pricingConditions = new PricingConditionsJpaEmbeddable(
                    java.math.BigDecimal.ZERO,
                    java.math.BigDecimal.ZERO,
                    null, null, null, "EUR"
            );
        }
    }
}
