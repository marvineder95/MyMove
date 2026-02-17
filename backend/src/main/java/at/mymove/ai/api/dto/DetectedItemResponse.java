package at.mymove.ai.api.dto;

import at.mymove.ai.domain.DetectedItem;

/**
 * Response DTO für DetectedItem.
 */
public record DetectedItemResponse(
        String label,
        String description,
        double confidence,
        BoundingBoxResponse boundingBox,
        Double estimatedVolumeM3,
        int quantity
) {
    /**
     * Factory-Methode aus Domain Entity.
     */
    public static DetectedItemResponse from(DetectedItem item) {
        BoundingBoxResponse bbox = item.boundingBox() != null
                ? new BoundingBoxResponse(
                        item.boundingBox().x(),
                        item.boundingBox().y(),
                        item.boundingBox().width(),
                        item.boundingBox().height())
                : null;

        return new DetectedItemResponse(
                item.label(),
                item.description(),
                item.confidence(),
                bbox,
                item.estimatedVolumeM3(),
                item.quantity()
        );
    }
}
