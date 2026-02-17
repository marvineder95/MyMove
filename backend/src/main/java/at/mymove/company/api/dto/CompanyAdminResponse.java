package at.mymove.company.api.dto;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyStatus;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

/**
 * Response DTO für Company im Admin-Bereich.
 */
public record CompanyAdminResponse(
        UUID id,
        String name,
        String email,
        String atuNumber,
        String phone,
        String city,
        Set<String> services,
        PricingConditionsResponse pricingConditions,
        CompanyStatus status,
        Instant createdAt,
        Instant reviewedAt,
        String rejectionReason
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static CompanyAdminResponse from(Company company) {
        return new CompanyAdminResponse(
                company.id(),
                company.name(),
                company.email(),
                company.atuNumber(),
                company.phone(),
                company.city(),
                company.services().stream()
                        .map(Enum::name)
                        .collect(java.util.stream.Collectors.toSet()),
                PricingConditionsResponse.from(company.pricingConditions()),
                company.status(),
                company.createdAt(),
                company.reviewedAt(),
                company.rejectionReason()
        );
    }
}
