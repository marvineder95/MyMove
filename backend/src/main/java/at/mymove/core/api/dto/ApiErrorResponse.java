package at.mymove.core.api.dto;

import java.time.Instant;

/**
 * Standardisierte Error-Response für alle API-Fehler.
 * Wird vom GlobalExceptionHandler verwendet.
 */
public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        String requestId
) {

    public static ApiErrorResponse of(
            int status,
            String error,
            String message,
            String path,
            String requestId
    ) {
        return new ApiErrorResponse(
                Instant.now(),
                status,
                error,
                message,
                path,
                requestId
        );
    }
}