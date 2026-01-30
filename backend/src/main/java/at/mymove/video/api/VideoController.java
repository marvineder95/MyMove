package at.mymove.video.api;

import at.mymove.video.api.dto.VideoResponse;
import at.mymove.video.application.UploadVideoUseCase;
import at.mymove.video.domain.Video;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final UploadVideoUseCase uploadVideoUseCase;

    @PostMapping("/upload")
    public ResponseEntity<VideoResponse> upload(@RequestParam("file") MultipartFile file) {
        Video video = uploadVideoUseCase.execute(file);
        return ResponseEntity.ok(toResponse(video));
    }

    private static VideoResponse toResponse(Video v) {
        return new VideoResponse(
                v.id().toString(),
                v.filename(),
                v.contentType(),
                v.sizeBytes(),
                v.status().name(),
                v.createdAt(),
                v.storageRef()
        );
    }
}