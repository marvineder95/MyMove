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
public class GetOfferForCompanyUseCase {

    private final OfferRepository offerRepository;

    @Transactional(readOnly = true)
    public Offer execute(UUID offerId, UUID companyId) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }
        if (companyId == null) {
            throw new IllegalArgumentException("companyId is required");
        }

        return offerRepository.findByIdAndCompanyId(offerId, companyId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));
    }
}
