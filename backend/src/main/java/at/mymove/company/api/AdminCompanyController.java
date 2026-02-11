package at.mymove.company.api;

import at.mymove.company.api.dto.CompanyAdminResponse;
import at.mymove.company.application.ApproveCompanyUseCase;
import at.mymove.company.application.ListPendingCompaniesUseCase;
import at.mymove.company.application.RejectCompanyUseCase;
import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/companies")
@RequiredArgsConstructor
public class AdminCompanyController {

    private final ListPendingCompaniesUseCase listPendingCompaniesUseCase;
    private final ApproveCompanyUseCase approveCompanyUseCase;
    private final RejectCompanyUseCase rejectCompanyUseCase;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<CompanyAdminResponse> listPending(@RequestParam(required = false) String status) {
        CompanyStatus requested = parseStatus(status);
        if (requested != CompanyStatus.PENDING) {
            throw new IllegalArgumentException("only status=PENDING is supported");
        }

        return listPendingCompaniesUseCase.execute()
                .stream()
                .map(AdminCompanyController::toResponse)
                .toList();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public CompanyAdminResponse approve(@PathVariable String id) {
        UUID companyId = parseCompanyId(id);

        Company approved = approveCompanyUseCase.execute(companyId); // Nur 1 Parameter!
        return toResponse(approved);
    }

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
        return toResponse(rejected);
    }

    // ---- helpers ----

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

    private static CompanyAdminResponse toResponse(Company company) {
        return new CompanyAdminResponse(
                company.id(),
                company.name(),
                company.email(),
                company.status()
        );
    }

    // ---- request dto ----
    public static final class RejectCompanyRequest {
        @NotBlank
        public String reason;
    }
}