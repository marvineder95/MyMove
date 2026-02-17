package at.mymove.ai.api.dto;

/**
 * Response DTO für BoundingBox.
 */
public record BoundingBoxResponse(
        int x,
        int y,
        int width,
        int height
) {
}
