package at.mymove.infrastructure.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadPath;

    public FileStorageService(@Value("${app.storage.upload-path:uploads}") String uploadPath) {
        this.uploadPath = Paths.get(uploadPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException e) {
            throw new FileStorageException("Upload-Verzeichnis konnte nicht erstellt werden", e);
        }
    }

    public String storeTradeLicense(MultipartFile file) {
        validateFile(file);

        String fileName = "trade-license_" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path target = uploadPath.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return fileName; // Speichere diesen Namen in der DB
        } catch (IOException e) {
            throw new FileStorageException("Gewerbeschein konnte nicht gespeichert werden", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Datei ist erforderlich");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Nur Bilder erlaubt (JPG, PNG)");
        }

        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            throw new IllegalArgumentException("Datei zu groß (max 5MB)");
        }
    }
}