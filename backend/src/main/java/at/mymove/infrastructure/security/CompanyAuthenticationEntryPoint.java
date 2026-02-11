package at.mymove.infrastructure.security;

import at.mymove.core.api.RequestIdFilter;
import at.mymove.core.api.dto.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CompanyAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException {
        HttpStatus status = resolveStatus(authException);
        String requestId = (String) request.getAttribute(RequestIdFilter.ATTR_REQUEST_ID);
        ApiErrorResponse body = ApiErrorResponse.of(
                status.value(),
                status.getReasonPhrase(),
                authException.getMessage(),
                request.getRequestURI(),
                requestId
        );

        if (status == HttpStatus.UNAUTHORIZED) {
            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Basic realm=\"MyMove\"");
        }
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), body);
    }

    private HttpStatus resolveStatus(AuthenticationException ex) {
        if (ex instanceof CompanyNotApprovedAuthenticationException) {
            return HttpStatus.FORBIDDEN;
        }
        if (ex instanceof CompanyNotFoundAuthenticationException) {
            return HttpStatus.NOT_FOUND;
        }
        return HttpStatus.UNAUTHORIZED;
    }
}
