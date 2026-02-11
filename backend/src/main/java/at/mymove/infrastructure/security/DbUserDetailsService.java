package at.mymove.infrastructure.security;

import at.mymove.auth.domain.Role;
import at.mymove.auth.infrastructure.persistence.UserAccountJpaRepository;
import at.mymove.company.domain.CompanyStatus;
import at.mymove.company.infrastructure.persistence.CompanyJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DbUserDetailsService implements UserDetailsService {

    private final UserAccountJpaRepository repo;
    private final CompanyJpaRepository companyRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = repo.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("user not found"));

        if (user.getRole() == Role.COMPANY) {
            var companyId = user.getCompanyId();
            if (companyId == null) {
                throw new CompanyNotFoundAuthenticationException(null);
            }
            var company = companyRepo.findById(companyId)
                    .orElseThrow(() -> new CompanyNotFoundAuthenticationException(companyId));
            CompanyStatus status = company.getStatus();
            if (status != CompanyStatus.APPROVED) {
                throw new CompanyNotApprovedAuthenticationException(companyId);
            }
        }

        var authorities = AuthorityUtils.createAuthorityList("ROLE_" + user.getRole().name());
        return new MyMoveUserDetails(
                user.getEmail(),
                user.getPasswordHash(),
                authorities,
                user.getCompanyId()
        );
    }
}
