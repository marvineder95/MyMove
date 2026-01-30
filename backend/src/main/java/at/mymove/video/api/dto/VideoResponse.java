package at.mymove.video.api.dto;

import java.time.Instant;

public record VideoResponse(
        String id,
        String filename,
        String contentType,
        long sizeBytes,
        String status,
        Instant createdAt,
        String storageRef
) {
}