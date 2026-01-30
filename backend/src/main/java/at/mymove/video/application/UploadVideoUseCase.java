package at.mymove.video.application;

import at.mymove.video.domain.Video;
import at.mymove.video.domain.VideoStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UploadVideoUseCase {

    private final VideoRepository videoRepository;
    private final VideoStorage videoStorage;

    @Transactional
    public Video execute(MultipartFile file) {
        UUID id = UUID.randomUUID();

        Video uploading = new Video(
                id,
                file.getOriginalFilename(),
                file.getContentType(),
                file.getSize(),
                VideoStatus.UPLOADING,
                Instant.now(),
                null
        );

        videoRepository.save(uploading);

        String storageRef;
        try (InputStream in = file.getInputStream()) {
            storageRef = videoStorage.store(id.toString(), in);
        } catch (Exception e) {
            videoRepository.save(new Video(
                    uploading.id(),
                    uploading.filename(),
                    uploading.contentType(),
                    uploading.sizeBytes(),
                    VideoStatus.FAILED,
                    uploading.createdAt(),
                    null
            ));
            throw new IllegalStateException(e);
        }

        Video uploaded = new Video(
                uploading.id(),
                uploading.filename(),
                uploading.contentType(),
                uploading.sizeBytes(),
                VideoStatus.UPLOADED,
                uploading.createdAt(),
                storageRef
        );

        return videoRepository.save(uploaded);
    }
}