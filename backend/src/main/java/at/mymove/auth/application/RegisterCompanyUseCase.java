package at.mymove.auth.application;

import at.mymove.auth.api.dto.RegisterCompanyRequest;
import at.mymove.auth.api.dto.RegisterCompanyResponse;
import at.mymove.auth.domain.Role;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaEntity;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaRepository;
import at.mymove.company.domain.CompanyStatus;
import at.mymove.company.infrastructure.persistence.CompanyJpaEntity;
import at.mymove.company.infrastructure.persistence.CompanyJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service("authRegisterCompanyUseCase")
@RequiredArgsConstructor
public class RegisterCompanyUseCase {

    private final CompanyJpaRepository companyRepo;
    private final UserAccountJpaRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public RegisterCompanyResponse execute(RegisterCompanyRequest req) {
        if (companyRepo.existsByEmail(req.email()) || userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("email already exists");
        }

        UUID companyId = UUID.randomUUID();
        companyRepo.save(CompanyJpaEntity.builder()
                .id(companyId)
                .email(req.email())
                .name(req.companyName())
                .passwordHash(passwordEncoder.encode(req.password()))  // Falls Company auch ein Passwort braucht
                .addressLine("")  // TODO: In Request ergänzen?
                .city("")         // TODO: In Request ergänzen?
                .postalCode("")   // TODO: In Request ergänzen?
                .country("")      // TODO: In Request ergänzen?
                .phone("")        // TODO: In Request ergänzen?
                .website(null)
                .atuNumber(null)
                .services(Set.of())  // Leeres Set
                .tradeLicenseFileRef("")  // TODO: In Request ergänzen?
                .status(CompanyStatus.PENDING)
                // createdAt wird automatisch via @PrePersist gesetzt
                .build());

        userRepo.save(new UserAccountJpaEntity(
                UUID.randomUUID(),
                req.email(),
                passwordEncoder.encode(req.password()),
                Role.COMPANY,
                companyId
        ));

        return new RegisterCompanyResponse(companyId, req.email());
    }
}
