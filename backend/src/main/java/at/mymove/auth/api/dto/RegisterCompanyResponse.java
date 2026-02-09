package at.mymove.auth.api.dto;

import java.util.UUID;

public record RegisterCompanyResponse(
        UUID companyId,
        String email
) {}