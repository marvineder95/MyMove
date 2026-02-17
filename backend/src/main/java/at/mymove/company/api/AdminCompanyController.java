package at.mymove.company.api;

import at.mymove.company.api.dto.CompanyAdminResponse;
import at.mymove.company.api.dto.CompanyStatsResponse;
import at.mymove.company.application.ApproveCompanyUseCase;
import at.mymove.company.application.ListApprovedCompaniesUseCase;
import at.mymove.company.application.ListPendingCompaniesUseCase;
import at.mymove.company.application.ListRejectedCompaniesUseCase;
import at.mymove.company.application.RejectCompanyUseCase;
import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.company.domain.CompanyStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin REST Controller für Company-Management.
 */
@RestController
@RequestMapping("/api/v1/admin/companies")
@RequiredArgsConstructor
public class AdminCompanyController {

    private final ListPendingCompaniesUseCase listPendingCompaniesUseCase;
    private final ListApprovedCompaniesUseCase listApprovedCompaniesUseCase;
    private final ListRejectedCompaniesUseCase listRejectedCompaniesUseCase;
    private final ApproveCompanyUseCase approveCompanyUseCase;
    private final RejectCompanyUseCase rejectCompanyUseCase;
    private final CompanyRepository companyRepository;

    /**
     * Statistik über alle Firmen-Status
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public CompanyStatsResponse getStats() {
        long pending = companyRepository.countByStatus(CompanyStatus.PENDING);
        long approved = companyRepository.countByStatus(CompanyStatus.APPROVED);
        long rejected = companyRepository.countByStatus(CompanyStatus.REJECTED);
        
        return new CompanyStatsResponse(pending, approved, rejected, pending + approved + rejected);
    }

    /**
     * Listet Firmen nach Status auf.
     * Unterstützt: PENDING, APPROVED, REJECTED
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<CompanyAdminResponse> listCompanies(
            @RequestParam(required = false, defaultValue = "PENDING") String status
    ) {
        CompanyStatus requested = parseStatus(status);

        return switch (requested) {
            case PENDING -> listPendingCompaniesUseCase.execute()
                    .stream()
                    .map(CompanyAdminResponse::from)
                    .toList();
            case APPROVED -> listApprovedCompaniesUseCase.execute()
                    .stream()
                    .map(CompanyAdminResponse::from)
                    .toList();
            case REJECTED -> listRejectedCompaniesUseCase.execute()
                    .stream()
                    .map(CompanyAdminResponse::from)
                    .toList();
        };
    }

    /**
     * Genehmigt eine PENDING Firma.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public CompanyAdminResponse approve(@PathVariable String id) {
        UUID companyId = parseCompanyId(id);

        Company approved = approveCompanyUseCase.execute(companyId);
        return CompanyAdminResponse.from(approved);
    }

    /**
     * Lehnt eine PENDING Firma ab.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public CompanyAdminResponse reject(
            @PathVariable String id,
            @RequestBody RejectCompanyRequest body
    ) {
        UUID companyId = parseCompanyId(id);
        String adminEmail = requireAdminEmail();

        if (body == null || body.reason == null || body.reason.isBlank()) {
            throw new IllegalArgumentException("reason is required");
        }

        Company rejected = rejectCompanyUseCase.execute(companyId, adminEmail, body.reason);
        return CompanyAdminResponse.from(rejected);
    }

    // ---- Helper ----

    private static UUID parseCompanyId(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("companyId is required");
        }
        try {
            return UUID.fromString(id);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("companyId must be a valid UUID");
        }
    }

    private static CompanyStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return CompanyStatus.PENDING;
        }
        try {
            return CompanyStatus.valueOf(status);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("status must be one of: PENDING, APPROVED, REJECTED");
        }
    }

    private static String requireAdminEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("adminEmail is required");
        }
        return authentication.getName();
    }

    // ---- Request DTO ----
    public static final class RejectCompanyRequest {
        @NotBlank
        public String reason;
    }
}
