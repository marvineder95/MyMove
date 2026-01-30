package at.mymove.video.infrastructure.persistence;

import at.mymove.video.application.VideoStorage;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@Component
public class LocalVideoStorage implements VideoStorage {

    private static final Path BASE_DIR = Path.of("data/videos");

    @Override
    public String store(String key, InputStream data) {
        try {
            Files.createDirectories(BASE_DIR);
            Path target = BASE_DIR.resolve(key);
            Files.copy(data, target, StandardCopyOption.REPLACE_EXISTING);
            return target.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to store video", e);
        }
    }
}