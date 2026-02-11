package at.mymove.auth.api.dto;

import at.mymove.company.domain.CompanyService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public record RegisterCompanyRequest(
        @NotBlank String companyName,
        @Email @NotBlank String email,
        @NotBlank String password,

        // Adresse
        @NotBlank String addressLine,
        @NotBlank String city,
        @NotBlank String postalCode,
        @NotBlank String country,

        // Kontakt
        @NotBlank String phone,
        String website,  // optional

        // UID Nummer (ATU = Austrian Taxpayer Number)
        @NotBlank String atuNumber,

        // Leistungen
        @NotEmpty Set<CompanyService> services,

        // Gewerbeschein als Bild
        MultipartFile tradeLicenseFile
) {}