package at.mymove.company.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.company.domain.CompanyService;
import at.mymove.company.domain.PricingConditions;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

/**
 * Use Case: Registriert eine neue Umzugsfirma.
 *
 * Die Firma wird im Status PENDING angelegt und muss durch einen Admin
 * genehmigt werden, bevor sie Angebote erstellen kann.
 */
@Service
@RequiredArgsConstructor
public class RegisterCompanyUseCase {

    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registriert eine neue Firma mit den minimalen erforderlichen Preiskonditionen.
     *
     * @param email              E-Mail-Adresse (Login)
     * @param rawPassword        Passwort (wird gehasht)
     * @param name               Firmenname
     * @param addressLine        Straße und Hausnummer
     * @param city               Ort
     * @param postalCode         PLZ
     * @param country            Land
     * @param phone              Telefonnummer
     * @param website            Webseite (optional)
     * @param atuNumber          ATU-Nummer (Pflicht)
     * @param services           Angebotene Dienstleistungen
     * @param tradeLicenseFileRef Referenz zum hochgeladenen Gewerbeschein
     * @param hourlyRate         Stundensatz (EUR)
     * @param travelFee          Anfahrtsgebühr (EUR)
     * @return Die registrierte Firma im Status PENDING
     */
    @Transactional
    public Company execute(
            String email,
            String rawPassword,
            String name,
            String addressLine,
            String city,
            String postalCode,
            String country,
            String phone,
            String website,
            String atuNumber,
            Set<CompanyService> services,
            String tradeLicenseFileRef,
            BigDecimal hourlyRate,
            BigDecimal travelFee
    ) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email is required");
        if (rawPassword == null || rawPassword.isBlank()) throw new IllegalArgumentException("password is required");
        if (atuNumber == null || atuNumber.isBlank()) throw new IllegalArgumentException("atuNumber is required");
        if (hourlyRate == null) throw new IllegalArgumentException("hourlyRate is required");
        if (travelFee == null) throw new IllegalArgumentException("travelFee is required");

        String passwordHash = passwordEncoder.encode(rawPassword);

        PricingConditions pricingConditions = PricingConditions.of(hourlyRate, travelFee);

        Company company = Company.registerPending(
                email,
                passwordHash,
                name,
                addressLine,
                city,
                postalCode,
                country,
                phone,
                website,
                atuNumber,
                services,
                tradeLicenseFileRef,
                pricingConditions
        );

        return companyRepository.save(company);
    }

    /**
     * Registriert eine neue Firma mit erweiterten Preiskonditionen.
     */
    @Transactional
    public Company execute(
            String email,
            String rawPassword,
            String name,
            String addressLine,
            String city,
            String postalCode,
            String country,
            String phone,
            String website,
            String atuNumber,
            Set<CompanyService> services,
            String tradeLicenseFileRef,
            PricingConditions pricingConditions
    ) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email is required");
        if (rawPassword == null || rawPassword.isBlank()) throw new IllegalArgumentException("password is required");
        if (atuNumber == null || atuNumber.isBlank()) throw new IllegalArgumentException("atuNumber is required");
        if (pricingConditions == null) throw new IllegalArgumentException("pricingConditions is required");

        String passwordHash = passwordEncoder.encode(rawPassword);

        Company company = Company.registerPending(
                email,
                passwordHash,
                name,
                addressLine,
                city,
                postalCode,
                country,
                phone,
                website,
                atuNumber,
                services,
                tradeLicenseFileRef,
                pricingConditions
        );

        return companyRepository.save(company);
    }
}
