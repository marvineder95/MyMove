package at.mymove.company.application;

import at.mymove.company.domain.Company;
import at.mymove.company.domain.CompanyRepository;
import at.mymove.company.domain.CompanyStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListApprovedCompaniesUseCase {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<Company> execute() {
        return companyRepository.findAllByStatus(CompanyStatus.APPROVED);
    }
}
