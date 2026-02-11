package at.mymove.company.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.company.domain.CompanyStatus;
import at.mymove.core.api.GlobalExceptionHandler;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApproveCompanyUseCase {

    private final CompanyRepository companyRepository;

    @Transactional
    public Company execute(UUID companyId) {
        if (companyId == null) {
            throw new IllegalArgumentException("companyId is required");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new GlobalExceptionHandler.CompanyNotFoundException(companyId));

        if (company.status() != CompanyStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING companies can be approved");
        }

        String adminEmail = requireAuthenticatedUsername();
        Company approved = company.approve(adminEmail, Instant.now());

        return companyRepository.save(approved);
    }

    private static String requireAuthenticatedUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalArgumentException("adminEmail is required");
        }
        return auth.getName();
    }
}