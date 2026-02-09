package at.mymove.infrastructure.security;

import at.mymove.auth.domain.Role;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaEntity;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserAccountJpaRepository repo;
    private final PasswordEncoder encoder;
    private final Environment env;

    @Override
    public void run(String... args) {
        String email = env.getProperty("mymove.admin.email");
        String pw = env.getProperty("mymove.admin.password");

        if (email == null || pw == null) return;
        if (repo.existsByEmail(email)) return;

        repo.save(new UserAccountJpaEntity(
                UUID.randomUUID(),
                email,
                encoder.encode(pw),
                Role.ADMIN,
                null
        ));
    }
}