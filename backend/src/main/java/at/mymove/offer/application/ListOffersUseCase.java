package at.mymove.offer.application;

import at.mymove.offer.domain.Offer;
import at.mymove.offer.domain.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListOffersUseCase {

    private final OfferRepository offerRepository;

    public List<Offer> execute() {
        return offerRepository.findAll();
    }
}