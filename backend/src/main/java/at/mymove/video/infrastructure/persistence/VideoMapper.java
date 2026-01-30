package at.mymove.video.infrastructure.persistence;

import at.mymove.video.domain.Video;

final class VideoMapper {

    private VideoMapper() {}

    static VideoJpaEntity toJpa(Video video) {
        return new VideoJpaEntity(
                video.id(),
                video.filename(),
                video.contentType(),
                video.sizeBytes(),
                video.status(),
                video.createdAt(),
                video.storageRef()
        );
    }

    static Video toDomain(VideoJpaEntity entity) {
        return new Video(
                entity.getId(),
                entity.getFilename(),
                entity.getContentType(),
                entity.getSizeBytes(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getStorageRef()
        );
    }
}