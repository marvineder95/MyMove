package at.mymove.auth.api;

import at.mymove.auth.api.dto.RegisterCompanyRequest;
import at.mymove.auth.api.dto.RegisterCompanyResponse;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaEntity;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaRepository;
import at.mymove.company.application.RegisterCompanyUseCase;
import at.mymove.company.domain.Company;
import at.mymove.company.domain.PricingConditions;
import at.mymove.company.infrastructure.persistence.CompanyJpaRepository;
import at.mymove.infrastructure.storage.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller für Authentifizierung und Registrierung.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final FileStorageService fileStorageService;
    private final RegisterCompanyUseCase registerCompanyUseCase;
    private final CompanyJpaRepository companyRepo;
    private final UserAccountJpaRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registriert eine neue Umzugsfirma.
     * Die Firma wird im Status PENDING angelegt und muss durch einen Admin genehmigt werden.
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RegisterCompanyResponse> register(
            @Valid @ModelAttribute RegisterCompanyRequest req) {

        // 1. Prüfen ob Email bereits existiert
        if (companyRepo.existsByEmail(req.email()) || userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email existiert bereits");
        }

        // 2. Gewerbeschein speichern
        String tradeLicenseFileRef = fileStorageService.storeTradeLicense(req.tradeLicenseFile());

        // 3. PricingConditions aus Request erstellen
        PricingConditions pricingConditions = PricingConditions.of(
                req.hourlyRate(),
                req.travelFee(),
                req.baseFee(),
                req.extraChargePercent(),
                req.minimumPrice()
        );

        // 4. Company registrieren
        Company company = registerCompanyUseCase.execute(
                req.email(),
                req.password(),
                req.companyName(),
                req.addressLine(),
                req.city(),
                req.postalCode(),
                req.country(),
                req.phone(),
                req.website(),
                req.atuNumber(),
                req.services(),
                tradeLicenseFileRef,
                pricingConditions
        );

        // 5. User Account erstellen
        userRepo.save(new UserAccountJpaEntity(
                UUID.randomUUID(),
                req.email(),
                passwordEncoder.encode(req.password()),
                at.mymove.auth.domain.Role.COMPANY,
                company.id()
        ));

        return ResponseEntity.ok(new RegisterCompanyResponse(company.id(), req.email()));
    }
}
