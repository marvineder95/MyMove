package at.mymove.company.infrastructure.persistence;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.company.domain.CompanyStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
class CompanyRepositoryImpl implements CompanyRepository {

    private final CompanyJpaRepository jpaRepository;

    @Override
    public Company save(Company company) {
        CompanyJpaEntity saved = jpaRepository.save(CompanyMapper.toJpa(company));
        return CompanyMapper.toDomain(saved);
    }

    @Override
    public Optional<Company> findById(UUID id) {
        return jpaRepository.findById(id)
                .map(CompanyMapper::toDomain);
    }

    @Override
    public List<Company> findAllByStatus(CompanyStatus status) {
        List<CompanyJpaEntity> entities = status == CompanyStatus.PENDING
                ? jpaRepository.findAllByStatusOrStatusIsNull(status)
                : jpaRepository.findAllByStatus(status);

        return entities
                .stream()
                .map(CompanyMapper::toDomain)
                .toList();
    }

    @Override
    public long countByStatus(CompanyStatus status) {
        return jpaRepository.countByStatus(status);
    }
}
