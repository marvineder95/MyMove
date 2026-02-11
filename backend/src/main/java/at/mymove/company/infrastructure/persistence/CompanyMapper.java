package at.mymove.company.infrastructure.persistence;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyService;
import at.mymove.company.domain.CompanyStatus;

import java.util.HashSet;
import java.util.Set;

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
                .status(company.status())
                .createdAt(company.createdAt())
                .reviewedAt(company.reviewedAt())
                .reviewedByAdminEmail(company.reviewedByAdminEmail())
                .rejectionReason(company.rejectionReason())
                .build();
    }
}