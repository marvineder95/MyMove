package at.mymove.core.infrastructure.security;

import at.mymove.core.api.ApiPaths;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, ApiPaths.API_V1 + "/ping/**").permitAll()
                        .requestMatchers(HttpMethod.POST, ApiPaths.API_V1 + "/videos/**").permitAll()
                        // optional: alles unter /api/v1 vorerst offen
                        // .requestMatchers(ApiPaths.API_V1 + "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .build();
    }
}