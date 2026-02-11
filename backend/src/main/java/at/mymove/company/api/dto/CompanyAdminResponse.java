package at.mymove.company.api.dto;

import at.mymove.company.domain.CompanyStatus;

import java.util.UUID;

public record CompanyAdminResponse(
        UUID id,
        String name,
        String email,
        CompanyStatus status
) {
}