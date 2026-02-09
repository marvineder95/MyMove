package at.mymove.company.domain;

import java.util.UUID;

public record Company(
        UUID id,
        String name,
        String email
) {
    public Company {
        if (id == null) throw new IllegalArgumentException("id is required");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("name is required");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("email is required");
    }
}