package at.mymove.infrastructure.security;

import org.springframework.security.core.AuthenticationException;

import java.util.UUID;

public class CompanyNotFoundAuthenticationException extends AuthenticationException {
    public CompanyNotFoundAuthenticationException(UUID companyId) {
        super(companyId == null ? "Company not found" : "Company not found: " + companyId);
    }
}
