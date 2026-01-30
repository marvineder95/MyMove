package at.mymove.video.application;

import at.mymove.video.domain.Video;
import at.mymove.video.domain.VideoStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateVideoUseCase {

    private final VideoRepository videoRepository;

    @Transactional
    public Video create(String filename, String contentType, long sizeBytes) {

        if (sizeBytes <= 0) {
            throw new IllegalArgumentException("sizeBytes must be greater than 0");
        }

        Video video = new Video(
                UUID.randomUUID(),
                filename,
                contentType,
                sizeBytes,
                VideoStatus.CREATED,
                Instant.now(),
                null
        );

        return videoRepository.save(video);
    }
}