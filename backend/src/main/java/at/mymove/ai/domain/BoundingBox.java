package at.mymove.ai.domain;

/**
 * Bounding Box für ein erkanntes Objekt im Video.
 *
 * @param x X-Koordinate (oben links)
 * @param y Y-Koordinate (oben links)
 * @param width Breite
 * @param height Höhe
 */
public record BoundingBox(
        int x,
        int y,
        int width,
        int height
) {
    public BoundingBox {
        if (width < 0) throw new IllegalArgumentException("width must not be negative");
        if (height < 0) throw new IllegalArgumentException("height must not be negative");
    }

    public int area() {
        return width * height;
    }
}
