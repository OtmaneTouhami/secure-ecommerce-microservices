package ma.enset.commandservice.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@Order(1)
public class MdcFilter extends OncePerRequestFilter {

    private static final String USER_ID_KEY = "userId";
    private static final String USERNAME_KEY = "username";
    private static final String REQUEST_ID_KEY = "requestId";
    private static final String CLIENT_IP_KEY = "clientIp";

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String requestId = UUID.randomUUID().toString().substring(0, 8);
            MDC.put(REQUEST_ID_KEY, requestId);
            
            String clientIp = getClientIp(request);
            MDC.put(CLIENT_IP_KEY, clientIp);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof JwtAuthenticationToken jwtAuth) {
                Jwt jwt = jwtAuth.getToken();
                String userId = jwt.getSubject();
                String username = jwt.getClaimAsString("preferred_username");
                
                MDC.put(USER_ID_KEY, userId != null ? userId : "anonymous");
                MDC.put(USERNAME_KEY, username != null ? username : "anonymous");
            } else {
                MDC.put(USER_ID_KEY, "anonymous");
                MDC.put(USERNAME_KEY, "anonymous");
            }

            response.setHeader("X-Request-ID", requestId);
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
