package at.mymove.offer.application;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import at.mymove.video.application.DeleteVideoUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SendOfferUseCase {

    private final OfferRepository offerRepository;
    private final DeleteVideoUseCase deleteVideoUseCase;

    /**
     * Markiert ein Angebot als SENT und löscht anschließend das zugehörige Video.
     */
    @Transactional
    public Offer execute(UUID offerId) {
        if (offerId == null) {
            throw new IllegalArgumentException("offerId is required");
        }

        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new IllegalArgumentException("offer not found"));

        Offer sent = offer.markSent(Instant.now());
        Offer saved = offerRepository.save(sent);

        // Privacy-Decision: Video sofort nach Versand löschen
        deleteVideoUseCase.execute(saved.videoId());

        return saved;
    }
}