package at.mymove.company.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.company.domain.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class RegisterCompanyUseCase {

    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

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
            String tradeLicenseFileRef
    ) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email is required");
        if (rawPassword == null || rawPassword.isBlank()) throw new IllegalArgumentException("password is required");

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
                tradeLicenseFileRef
        );

        return companyRepository.save(company);
    }
}