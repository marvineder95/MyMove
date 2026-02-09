package at.mymove.company.infrastructure.persistence;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.UUID;

@Getter
@Entity
@Table(name = "companies")
public class CompanyJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    protected CompanyJpaEntity() {}

    public CompanyJpaEntity(UUID id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}