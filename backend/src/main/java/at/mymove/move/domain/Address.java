package at.mymove.move.domain;

import java.util.Objects;

public record Address(
        String street,
        String houseNumber,
        String postalCode,
        String city,
        String country,
        String additionalInfo
) {
    public Address {
        street = normalize(street);
        houseNumber = normalize(houseNumber);
        postalCode = normalize(postalCode);
        city = normalize(city);
        country = normalize(country);
        additionalInfo = normalize(additionalInfo);

        if (isBlank(street)) {
            throw new IllegalArgumentException("street is required");
        }
        if (isBlank(houseNumber)) {
            throw new IllegalArgumentException("houseNumber is required");
        }
        if (isBlank(postalCode)) {
            throw new IllegalArgumentException("postalCode is required");
        }
        if (isBlank(city)) {
            throw new IllegalArgumentException("city is required");
        }
        if (isBlank(country)) {
            throw new IllegalArgumentException("country is required");
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    public String formattedLine() {
        return street + " " + houseNumber + ", " + postalCode + " " + city + ", " + country;
    }
}