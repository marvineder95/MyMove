package at.mymove.video.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;

@Configuration
public class VideoStorageConfig {

    @Bean
    public Path videoStorageBaseDir(
            @Value("${mymove.video.storage.base-dir:data/videos}") String baseDir
    ) {
        return Path.of(baseDir);
    }
}