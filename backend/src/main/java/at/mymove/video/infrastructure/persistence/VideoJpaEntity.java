package at.mymove.video.infrastructure.persistence;

import at.mymove.video.domain.VideoStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "videos")
public class VideoJpaEntity {

    @Id
    private UUID id;

    private String filename;
    private String contentType;
    private long sizeBytes;

    @Enumerated(EnumType.STRING)
    private VideoStatus status;

    private Instant createdAt;

    private String storageRef;

    protected VideoJpaEntity() {
    }

    public VideoJpaEntity(
            UUID id,
            String filename,
            String contentType,
            long sizeBytes,
            VideoStatus status,
            Instant createdAt,
            String storageRef
    ) {
        this.id = id;
        this.filename = filename;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.status = status;
        this.createdAt = createdAt;
        this.storageRef = storageRef;
    }

    public UUID getId() { return id; }
    public String getFilename() { return filename; }
    public String getContentType() { return contentType; }
    public long getSizeBytes() { return sizeBytes; }
    public VideoStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public String getStorageRef() { return storageRef; }
}