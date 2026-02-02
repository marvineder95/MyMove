package at.mymove.offer.application;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateOfferUseCase {

    private final OfferRepository offerRepository;

    /**
     * Erstellt ein neues Angebot im Status DRAFT.
     * Das Video wird nur referenziert (videoId), nicht verarbeitet.
     */
    @Transactional
    public Offer execute(UUID videoId) {
        if (videoId == null) {
            throw new IllegalArgumentException("videoId is required");
        }

        Offer draft = Offer.draft(videoId);
        return offerRepository.save(draft);
    }
}