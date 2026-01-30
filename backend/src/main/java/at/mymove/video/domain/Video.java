package at.mymove.video.domain;

import java.time.Instant;
import java.util.UUID;

public record Video(
        UUID id,
        String filename,
        String contentType,
        long sizeBytes,
        VideoStatus status,
        Instant createdAt,
        String storageRef
) {
}