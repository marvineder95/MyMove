package at.mymove.company.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.core.api.GlobalExceptionHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RejectCompanyUseCase {

    private final CompanyRepository companyRepository;

    @Transactional
    public Company execute(UUID companyId, String adminEmail, String reason) {
        if (companyId == null) {
            throw new IllegalArgumentException("companyId is required");
        }
        if (adminEmail == null || adminEmail.isBlank()) {
            throw new IllegalArgumentException("adminEmail is required");
        }
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("reason is required");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new GlobalExceptionHandler.CompanyNotFoundException(companyId));

        Company rejected = company.reject(adminEmail, reason, Instant.now());
        return companyRepository.save(rejected);
    }
}