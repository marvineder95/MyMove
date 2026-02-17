package at.mymove.company.infrastructure.persistence;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyService;
import at.mymove.company.domain.CompanyStatus;
import at.mymove.company.domain.PricingConditions;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/**
 * Mapper zwischen Company Domain und JPA Entity.
 */
final class CompanyMapper {

    private CompanyMapper() {}

    static Company toDomain(CompanyJpaEntity entity) {
        if (entity == null) return null;

        // Null-Safety für Status
        CompanyStatus status = entity.getStatus() == null
                ? CompanyStatus.PENDING
                : entity.getStatus();

        // Immutable Set für Domain (best practice)
        Set<CompanyService> services = entity.getServices() == null
                ? Set.of()
                : Set.copyOf(entity.getServices());

        // PricingConditions mappen
        PricingConditions pricingConditions = toDomainPricingConditions(entity.getPricingConditions());

        return new Company(
                entity.getId(),
                entity.getEmail(),
                entity.getPasswordHash(),
                entity.getName(),
                entity.getAddressLine(),
                entity.getCity(),
                entity.getPostalCode(),
                entity.getCountry(),
                entity.getPhone(),
                entity.getWebsite(),
                entity.getAtuNumber(),
                services,
                entity.getTradeLicenseFileRef(),
                pricingConditions,
                status,
                entity.getCreatedAt(),
                entity.getReviewedAt(),
                entity.getReviewedByAdminEmail(),
                entity.getRejectionReason()
        );
    }

    static CompanyJpaEntity toJpa(Company company) {
        if (company == null) return null;

        // HashSet für JPA Entity (mutable, wie von JPA erwartet)
        Set<CompanyService> services = company.services() == null
                ? new HashSet<>()
                : new HashSet<>(company.services());

        return CompanyJpaEntity.builder()
                .id(company.id())
                .email(company.email())
                .passwordHash(company.passwordHash())
                .name(company.name())
                .addressLine(company.addressLine())
                .city(company.city())
                .postalCode(company.postalCode())
                .country(company.country())
                .phone(company.phone())
                .website(company.website())
                .atuNumber(company.atuNumber())
                .services(services)
                .tradeLicenseFileRef(company.tradeLicenseFileRef())
                .pricingConditions(toJpaPricingConditions(company.pricingConditions()))
                .status(company.status())
                .createdAt(company.createdAt())
                .reviewedAt(company.reviewedAt())
                .reviewedByAdminEmail(company.reviewedByAdminEmail())
                .rejectionReason(company.rejectionReason())
                .build();
    }

    private static PricingConditions toDomainPricingConditions(PricingConditionsJpaEmbeddable jpa) {
        if (jpa == null) {
            // Fallback für bestehende Daten ohne PricingConditions
            return PricingConditions.of(BigDecimal.ZERO, BigDecimal.ZERO);
        }
        return new PricingConditions(
                jpa.getHourlyRate(),
                jpa.getTravelFee(),
                jpa.getBaseFee(),
                jpa.getExtraChargePercent(),
                jpa.getMinimumPrice(),
                jpa.getCurrency()
        );
    }

    private static PricingConditionsJpaEmbeddable toJpaPricingConditions(PricingConditions domain) {
        if (domain == null) {
            return null;
        }
        return new PricingConditionsJpaEmbeddable(
                domain.hourlyRate(),
                domain.travelFee(),
                domain.baseFee(),
                domain.extraChargePercent(),
                domain.minimumPrice(),
                domain.currency()
        );
    }
}
