package at.mymove.video.application;

import at.mymove.video.domain.Video;

import java.util.Optional;
import java.util.UUID;

public interface VideoRepository {
    Video save(Video video);
    Optional<Video> findById(UUID id);
    void deleteById(UUID id);
}