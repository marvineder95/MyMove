package at.mymove.auth.api.dto;

import at.mymove.company.domain.CompanyService;
import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Set;

/**
 * Request DTO für die Firmen-Registrierung.
 */
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
        MultipartFile tradeLicenseFile,

        // Preiskonditionen (Pflicht)
        @NotNull @DecimalMin("1.00") @DecimalMax("500.00") BigDecimal hourlyRate,
        @NotNull @DecimalMin("0.00") @DecimalMax("1000.00") BigDecimal travelFee,

        // Optionale Preiskonditionen
        @DecimalMin("0.00") BigDecimal baseFee,
        @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal extraChargePercent,
        @DecimalMin("0.00") BigDecimal minimumPrice
) {}
