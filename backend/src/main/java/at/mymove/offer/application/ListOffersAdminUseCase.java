package at.mymove.offer.application;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListOffersAdminUseCase {

    private final OfferRepository offerRepository;

    @Transactional(readOnly = true)
    public List<Offer> execute(UUID companyId) {
        if (companyId == null) {
            return offerRepository.findAll();
        }
        return offerRepository.findAllByCompanyId(companyId);
    }
}
