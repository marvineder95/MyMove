package at.mymove.video.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateVideoRequest(
        @NotBlank String filename,
        @NotBlank String contentType,
        @Min(1) long sizeBytes
) {}