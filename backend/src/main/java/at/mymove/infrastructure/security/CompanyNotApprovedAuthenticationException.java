package at.mymove.infrastructure.security;

import org.springframework.security.core.AuthenticationException;

import java.util.UUID;

public class CompanyNotApprovedAuthenticationException extends AuthenticationException {
    public CompanyNotApprovedAuthenticationException(UUID companyId) {
        super(companyId == null ? "Company not approved" : "Company not approved: " + companyId);
    }
}
