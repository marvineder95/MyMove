package at.mymove.auth.domain;

import java.util.UUID;

public record UserAccount(
        UUID id,
        String email,
        String passwordHash,
        Role role,
        UUID companyId // null für ADMIN
) {
    public UserAccount {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email is required");
        if (passwordHash == null || passwordHash.isBlank()) throw new IllegalArgumentException("passwordHash is required");
        if (role == null) throw new IllegalArgumentException("role is required");
        if (role == Role.COMPANY && companyId == null) throw new IllegalArgumentException("companyId is required for COMPANY");
    }
}