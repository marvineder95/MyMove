package at.mymove.offer.application;

import at.mymove.move.domain.MoveDetails;
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

    @Transactional
    public Offer execute(UUID videoId, MoveDetails moveDetails) {
        if (videoId == null) throw new IllegalArgumentException("videoId is required");
        if (moveDetails == null) throw new IllegalArgumentException("moveDetails is required");

        Offer offer = Offer.create(videoId, moveDetails);
        return offerRepository.save(offer);
    }
}