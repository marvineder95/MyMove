package at.mymove.auth.infrastructure.persistence;

import at.mymove.auth.domain.Role;
import jakarta.persistence.*;
import lombok.Getter;

import java.util.UUID;

@Getter
@Entity
@Table(name = "user_accounts")
public class UserAccountJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = true)
    private UUID companyId;

    protected UserAccountJpaEntity() {}

    public UserAccountJpaEntity(UUID id, String email, String passwordHash, Role role, UUID companyId) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.companyId = companyId;
    }
}