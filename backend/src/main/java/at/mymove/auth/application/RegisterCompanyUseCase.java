package at.mymove.auth.application;

import at.mymove.auth.api.dto.RegisterCompanyRequest;
import at.mymove.auth.api.dto.RegisterCompanyResponse;
import at.mymove.auth.domain.Role;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaEntity;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaRepository;
import at.mymove.company.infrastructure.persistence.CompanyJpaEntity;
import at.mymove.company.infrastructure.persistence.CompanyJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
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
        companyRepo.save(new CompanyJpaEntity(companyId, req.companyName(), req.email()));

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