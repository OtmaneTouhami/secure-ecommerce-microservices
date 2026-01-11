package ma.enset.commandservice.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

@Slf4j
@Component
@Order(2)
public class RequestResponseLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        if (isSkippablePath(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();

        try {
            logRequest(requestWrapper);
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            logResponse(responseWrapper, duration);
            responseWrapper.copyBodyToResponse();
        }
    }

    private void logRequest(ContentCachingRequestWrapper request) {
        String queryString = request.getQueryString();
        String path = queryString != null 
                ? request.getRequestURI() + "?" + queryString 
                : request.getRequestURI();

        log.info(">>> REQUEST: {} {} | Content-Type: {}",
                request.getMethod(), path, request.getContentType());
    }

    private void logResponse(ContentCachingResponseWrapper response, long duration) {
        int status = response.getStatus();
        if (status >= 400) {
            log.warn("<<< RESPONSE: {} | Duration: {}ms | Size: {} bytes",
                    status, duration, response.getContentSize());
        } else {
            log.info("<<< RESPONSE: {} | Duration: {}ms | Size: {} bytes",
                    status, duration, response.getContentSize());
        }
    }

    private boolean isSkippablePath(String path) {
        return path.startsWith("/actuator") 
                || path.startsWith("/v3/api-docs") 
                || path.startsWith("/swagger");
    }
}
