package at.mymove.offer.application;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import at.mymove.core.api.GlobalExceptionHandler.OfferNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetOfferByIdUseCase {

    private final OfferRepository offerRepository;

    @Transactional(readOnly = true)
    public Offer execute(UUID offerId) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }

        return offerRepository.findById(offerId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));
    }
}
