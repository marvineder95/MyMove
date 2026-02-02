package at.mymove.video.application;

import at.mymove.video.domain.Video;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeleteVideoUseCase {

    private final VideoRepository videoRepository;
    private final VideoStorage videoStorage;

    @Transactional
    public void execute(UUID videoId) {
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null) return;

        // Datei löschen (wenn vorhanden)
        String storageRef = video.storageRef();
        if (storageRef != null && !storageRef.isBlank()) {
            try {
                videoStorage.delete(storageRef);
            } catch (Exception e) {
                throw new IllegalStateException("failed to delete stored video", e);
            }
        }

        // DB-Record löschen
        videoRepository.deleteById(videoId);
    }
}