package ma.enset.gatewayservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        // Public endpoints
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/webjars/**").permitAll()
                        .pathMatchers("/*/v3/api-docs/**").permitAll()
                        
                        // Product Service routes - Read access for authenticated users
                        .pathMatchers("GET", "/product-service/api/products/**").authenticated()
                        .pathMatchers("POST", "/product-service/api/products/**").hasRole("ADMIN")
                        .pathMatchers("PUT", "/product-service/api/products/**").hasRole("ADMIN")
                        .pathMatchers("DELETE", "/product-service/api/products/**").hasRole("ADMIN")
                        
                        // Order Service routes
                        .pathMatchers("POST", "/command-service/api/orders").hasRole("CLIENT")
                        .pathMatchers("GET", "/command-service/api/orders/my-orders").hasRole("CLIENT")
                        .pathMatchers("GET", "/command-service/api/orders").hasRole("ADMIN")
                        .pathMatchers("GET", "/command-service/api/orders/status/**").hasRole("ADMIN")
                        .pathMatchers("PUT", "/command-service/api/orders/*/status").hasRole("ADMIN")
                        .pathMatchers("/command-service/api/orders/**").authenticated()
                        
                        // Default - require authentication
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .build();
    }

    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        ReactiveJwtAuthenticationConverter converter = new ReactiveJwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(keycloakRoleConverter());
        return converter;
    }

    private Converter<Jwt, Flux<GrantedAuthority>> keycloakRoleConverter() {
        return jwt -> {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess == null) {
                return Flux.empty();
            }
            
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles == null) {
                return Flux.empty();
            }

            return Flux.fromIterable(roles)
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role));
        };
    }
}
