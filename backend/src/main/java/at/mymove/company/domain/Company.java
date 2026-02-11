package at.mymove.company.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public record Company(
        UUID id,
        String email,
        String passwordHash,
        String name,
        String addressLine,
        String city,
        String postalCode,
        String country,
        String phone,
        String website,
        String atuNumber,
        Set<CompanyService> services,
        String tradeLicenseFileRef,
        CompanyStatus status,
        Instant createdAt,
        Instant reviewedAt,
        String reviewedByAdminEmail,
        String rejectionReason
) {

    public Company {
        if (id == null) throw new IllegalArgumentException("id is required");

        if (isBlank(email)) throw new IllegalArgumentException("email is required");
        if (isBlank(passwordHash)) throw new IllegalArgumentException("passwordHash is required");

        if (isBlank(name)) throw new IllegalArgumentException("name is required");
        if (isBlank(addressLine)) throw new IllegalArgumentException("addressLine is required");
        if (isBlank(city)) throw new IllegalArgumentException("city is required");
        if (isBlank(postalCode)) throw new IllegalArgumentException("postalCode is required");
        if (isBlank(country)) throw new IllegalArgumentException("country is required");

        if (isBlank(phone)) throw new IllegalArgumentException("phone is required");

        if (services == null || services.isEmpty()) {
            throw new IllegalArgumentException("services is required");
        }

        if (isBlank(tradeLicenseFileRef)) {
            throw new IllegalArgumentException("tradeLicenseFileRef is required");
        }

        if (status == null) throw new IllegalArgumentException("status is required");
        if (createdAt == null) throw new IllegalArgumentException("createdAt is required");

        // status invariants
        if (status == CompanyStatus.PENDING) {
            if (reviewedAt != null) throw new IllegalArgumentException("reviewedAt must be null when status is PENDING");
            if (!isBlank(reviewedByAdminEmail)) throw new IllegalArgumentException("reviewedByAdminEmail must be null when status is PENDING");
            if (!isBlank(rejectionReason)) throw new IllegalArgumentException("rejectionReason must be null when status is PENDING");
        }

        if (status == CompanyStatus.APPROVED) {
            if (reviewedAt == null) throw new IllegalArgumentException("reviewedAt is required when status is APPROVED");
            if (isBlank(reviewedByAdminEmail)) throw new IllegalArgumentException("reviewedByAdminEmail is required when status is APPROVED");
            if (!isBlank(rejectionReason)) throw new IllegalArgumentException("rejectionReason must be null when status is APPROVED");
        }

        if (status == CompanyStatus.REJECTED) {
            if (reviewedAt == null) throw new IllegalArgumentException("reviewedAt is required when status is REJECTED");
            if (isBlank(reviewedByAdminEmail)) throw new IllegalArgumentException("reviewedByAdminEmail is required when status is REJECTED");
            if (isBlank(rejectionReason)) throw new IllegalArgumentException("rejectionReason is required when status is REJECTED");
        }

        // normalize
        email = normalizeEmail(email);
        website = normalizeOptional(website);
        atuNumber = normalizeOptional(atuNumber);
        reviewedByAdminEmail = normalizeOptional(reviewedByAdminEmail);
        rejectionReason = normalizeOptional(rejectionReason);

        services = Set.copyOf(services);
    }

    public static Company registerPending(
            String email,
            String passwordHash,
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
        return new Company(
                UUID.randomUUID(),
                normalizeEmail(email),
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
                tradeLicenseFileRef,
                CompanyStatus.PENDING,
                Instant.now(),
                null,
                null,
                null
        );
    }

    public Company approve(String adminEmail, Instant now) {
        if (status != CompanyStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING companies can be approved");
        }
        if (isBlank(adminEmail)) throw new IllegalArgumentException("adminEmail is required");
        if (now == null) throw new IllegalArgumentException("now is required");

        return new Company(
                id,
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
                tradeLicenseFileRef,
                CompanyStatus.APPROVED,
                createdAt,
                now,
                normalizeEmail(adminEmail),
                null
        );
    }

    public Company reject(String adminEmail, String reason, Instant now) {
        if (status != CompanyStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING companies can be rejected");
        }
        if (isBlank(adminEmail)) throw new IllegalArgumentException("adminEmail is required");
        if (isBlank(reason)) throw new IllegalArgumentException("reason is required");
        if (now == null) throw new IllegalArgumentException("now is required");

        return new Company(
                id,
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
                tradeLicenseFileRef,
                CompanyStatus.REJECTED,
                createdAt,
                now,
                normalizeEmail(adminEmail),
                reason.trim()
        );
    }

    private static boolean isBlank(String v) {
        return v == null || v.isBlank();
    }

    private static String normalizeEmail(String email) {
        Objects.requireNonNull(email, "email");
        return email.trim().toLowerCase();
    }

    private static String normalizeOptional(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isBlank() ? null : t;
    }
}