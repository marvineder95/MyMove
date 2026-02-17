package at.mymove.core.api;

import at.mymove.core.api.dto.ApiErrorResponse;
import at.mymove.infrastructure.storage.FileStorageException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {
        log.warn("[400] Bad Request - Path: {}, Message: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        String msg = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::formatFieldError)
                .collect(Collectors.joining(", "));

        log.warn("[400] Validation Error - Path: {}, Fields: {}", request.getRequestURI(), msg);
        return build(HttpStatus.BAD_REQUEST, msg, request);
    }

    @ExceptionHandler(OfferNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleOfferNotFound(
            OfferNotFoundException ex,
            HttpServletRequest request
    ) {
        log.warn("[404] Offer Not Found - Path: {}", request.getRequestURI());
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(CompanyNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleCompanyNotFound(
            CompanyNotFoundException ex,
            HttpServletRequest request
    ) {
        log.warn("[404] Company Not Found - Path: {}", request.getRequestURI());
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalState(
            IllegalStateException ex,
            HttpServletRequest request
    ) {
        log.warn("[409] Conflict - Path: {}, Message: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {
        log.warn("[405] Method Not Allowed - Path: {}, Method: {}", request.getRequestURI(), request.getMethod());
        return build(HttpStatus.METHOD_NOT_ALLOWED, ex.getMessage(), request);
    }

    @ExceptionHandler(FileStorageException.class)
    public ResponseEntity<ApiErrorResponse> handleFileStorage(
            FileStorageException ex,
            HttpServletRequest request
    ) {
        log.error("[500] File Storage Error - Path: {}", request.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "Datei konnte nicht gespeichert werden", request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleFallback(
            Exception ex,
            HttpServletRequest request
    ) {
        String requestId = (String) request.getAttribute(at.mymove.core.api.RequestIdFilter.ATTR_REQUEST_ID);
        log.error("[500] UNEXPECTED ERROR - Path: {}, RequestId: {}", request.getRequestURI(), requestId, ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + ex.getMessage(), request);
    }

    private ResponseEntity<ApiErrorResponse> build(
            HttpStatus status,
            String message,
            HttpServletRequest request
    ) {
        String requestId = (String) request.getAttribute(at.mymove.core.api.RequestIdFilter.ATTR_REQUEST_ID);

        ApiErrorResponse body = ApiErrorResponse.of(
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                requestId
        );

        return ResponseEntity.status(status).body(body);
    }

    private String formatFieldError(FieldError fe) {
        if (fe.getDefaultMessage() == null || fe.getDefaultMessage().isBlank()) {
            return fe.getField() + " is invalid";
        }
        return fe.getField() + ": " + fe.getDefaultMessage();
    }

    public static class OfferNotFoundException extends RuntimeException {
        public OfferNotFoundException(UUID offerId) {
            super("Offer not found: " + offerId);
        }
    }

    public static class CompanyNotFoundException extends RuntimeException {
        public CompanyNotFoundException(UUID companyId) {
            super("Company not found: " + companyId);
        }
    }
}
