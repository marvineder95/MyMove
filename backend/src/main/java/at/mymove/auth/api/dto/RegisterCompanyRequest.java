package at.mymove.auth.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterCompanyRequest(
        @NotBlank String companyName,
        @Email @NotBlank String email,
        @NotBlank String password
) {}