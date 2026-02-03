package at.mymove.offer.api;

import at.mymove.offer.api.dto.CreateOfferRequest;
import at.mymove.offer.api.dto.OfferResponse;
import at.mymove.offer.application.CreateOfferUseCase;
import at.mymove.offer.application.SendOfferUseCase;
import at.mymove.offer.domain.Offer;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class OfferController {

    private final CreateOfferUseCase createOfferUseCase;
    private final SendOfferUseCase sendOfferUseCase;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OfferResponse create(@Valid @RequestBody CreateOfferRequest request) {
        Offer created = createOfferUseCase.execute(request.videoId(), request.toMoveDetails());
        return toResponse(created);
    }

    @PostMapping("/{offerId}/send")
    public OfferResponse send(@PathVariable UUID offerId) {
        Offer sent = sendOfferUseCase.execute(offerId);
        return toResponse(sent);
    }

    private static OfferResponse toResponse(Offer offer) {
        return new OfferResponse(
                offer.id(),
                offer.status(),
                offer.videoId(),
                offer.createdAt(),
                offer.sentAt()
        );
    }
}