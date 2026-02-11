package at.mymove.infrastructure.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.UUID;

public class MyMoveUserDetails extends User {

    private final UUID companyId;

    public MyMoveUserDetails(
            String username,
            String password,
            Collection<? extends GrantedAuthority> authorities,
            UUID companyId
    ) {
        super(username, password, authorities);
        this.companyId = companyId;
    }

    public UUID getCompanyId() {
        return companyId;
    }
}
