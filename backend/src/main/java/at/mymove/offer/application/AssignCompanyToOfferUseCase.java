package at.mymove.offer.application;

import at.mymove.core.api.GlobalExceptionHandler.OfferNotFoundException;
import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssignCompanyToOfferUseCase {

    private final OfferRepository offerRepository;

    @Transactional
    public Offer execute(UUID offerId, UUID companyId) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }
        if (companyId == null) {
            throw new IllegalArgumentException("companyId is required");
        }

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));

        if (offer.companyId() != null) {
            throw new IllegalStateException("companyId is already assigned");
        }

        Offer updated = offer.assignCompany(companyId);
        return offerRepository.save(updated);
    }
}
