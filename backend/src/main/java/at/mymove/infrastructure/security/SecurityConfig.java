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

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .userDetailsService(userDetailsService)
                .authorizeHttpRequests(auth -> auth
                        // Public:
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/ping/**").permitAll()

                        // Customer creates offer (vorerst public):
                        .requestMatchers(HttpMethod.POST, "/api/v1/offers/**").permitAll()

                        // Company/Admin später für Listen/Details:
                        .requestMatchers(HttpMethod.GET, "/api/v1/offers/**").hasAnyRole(Role.ADMIN.name(), Role.COMPANY.name())
                        .requestMatchers("/api/v1/admin/**").hasRole(Role.ADMIN.name())

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