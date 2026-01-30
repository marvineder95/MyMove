package at.mymove.core.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class RequestIdFilter extends OncePerRequestFilter {

    public static final String ATTR_REQUEST_ID = "requestId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String incoming = request.getHeader(ApiHeaders.REQUEST_ID);
        String requestId = (incoming == null || incoming.isBlank())
                ? UUID.randomUUID().toString()
                : incoming.trim();

        // 1) für ExceptionHandler (Body)
        request.setAttribute(ATTR_REQUEST_ID, requestId);

        // 2) für Client (Header)
        response.setHeader(ApiHeaders.REQUEST_ID, requestId);

        filterChain.doFilter(request, response);
    }
}