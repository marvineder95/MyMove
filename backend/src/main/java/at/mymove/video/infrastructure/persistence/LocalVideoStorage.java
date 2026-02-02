package at.mymove.video.infrastructure.persistence;

import at.mymove.video.application.VideoStorage;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Component
public class LocalVideoStorage implements VideoStorage {

    private final Path baseDir = Path.of("data/videos");

    @Override
    public String store(String videoId, InputStream data) throws Exception {
        Files.createDirectories(baseDir);
        String fileName = videoId + ".bin";
        Path target = baseDir.resolve(fileName);
        Files.copy(data, target, StandardCopyOption.REPLACE_EXISTING);
        return fileName;
    }

    @Override
    public void delete(String storageRef) throws Exception {
        if (storageRef == null || storageRef.isBlank()) return;
        Path target = baseDir.resolve(storageRef);
        Files.deleteIfExists(target);
    }
}