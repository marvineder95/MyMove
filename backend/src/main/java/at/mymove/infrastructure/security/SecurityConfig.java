package at.mymove.infrastructure.security;

import at.mymove.auth.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;
    private final CompanyAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .userDetailsService(userDetailsService)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))

                .authorizeHttpRequests(auth -> auth

                        // ─────────────────────────────────────
                        // Public
                        // ─────────────────────────────────────
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/ping/**").permitAll()

                        // Kunde erstellt Offer (öffentlich)
                        .requestMatchers(HttpMethod.POST, "/api/v1/offers", "/api/v1/offers/").permitAll()

                        // Company-only: Offer-Details und eigene Offer-Liste
                        .requestMatchers(HttpMethod.GET, "/api/v1/offers/**")
                        .hasRole(Role.COMPANY.name())

                        // Company-only: Offer senden
                        .requestMatchers(HttpMethod.POST, "/api/v1/offers/*/send")
                        .hasRole(Role.COMPANY.name())

                        // Authenticated: Company-Zuweisung
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/offers/*/assign-company")
                        .authenticated()

                        .requestMatchers("/api/v1/admin/**")
                        .hasRole(Role.ADMIN.name())

                        // ─────────────────────────────────────
                        // Alles andere → authentifiziert
                        // ─────────────────────────────────────
                        .anyRequest().authenticated()
                )

                .httpBasic(Customizer.withDefaults())
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
