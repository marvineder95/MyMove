package at.mymove.infrastructure.security;

import at.mymove.auth.infrastructure.persistence.UserAccountJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DbUserDetailsService implements UserDetailsService {

    private final UserAccountJpaRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = repo.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("user not found"));

        return User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name()) // Spring prefix ROLE_
                .build();
    }
}