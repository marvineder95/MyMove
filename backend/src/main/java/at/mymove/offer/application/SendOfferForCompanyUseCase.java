package at.mymove.offer.application;

import at.mymove.core.api.GlobalExceptionHandler.OfferNotFoundException;
import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import at.mymove.offer.domain.OfferStatus;
import at.mymove.video.application.DeleteVideoUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SendOfferForCompanyUseCase {

    private final OfferRepository offerRepository;
    private final DeleteVideoUseCase deleteVideoUseCase;

    @Transactional
    public Offer execute(UUID offerId, UUID companyId) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }
        if (companyId == null) {
            throw new IllegalArgumentException("companyId is required");
        }

        Offer offer = offerRepository.findByIdAndCompanyId(offerId, companyId)
                .orElseThrow(() -> new OfferNotFoundException(offerId));

        if (offer.status() != OfferStatus.READY_TO_SEND) {
            throw new IllegalStateException("offer status does not allow sending");
        }

        Offer sent = offer.markSent(Instant.now());
        Offer saved = offerRepository.save(sent);

        // Privacy-Decision: Video sofort nach Versand löschen
        deleteVideoUseCase.execute(saved.videoId());

        return saved;
    }
}
