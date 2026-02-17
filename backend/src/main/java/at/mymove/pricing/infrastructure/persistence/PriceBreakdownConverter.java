package at.mymove.pricing.infrastructure.persistence;

import at.mymove.pricing.domain.PriceBreakdown;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * JPA Converter für PriceBreakdown.
 * Speichert die Aufschlüsselung als JSON.
 */
@Converter
public class PriceBreakdownConverter implements AttributeConverter<PriceBreakdown, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(PriceBreakdown breakdown) {
        if (breakdown == null) {
            return null;
        }
        try {
            Map<String, Object> map = new HashMap<>();
            map.put("baseFee", breakdown.baseFee());
            map.put("travelFee", breakdown.travelFee());
            map.put("laborCost", breakdown.laborCost());
            map.put("volumeCost", breakdown.volumeCost());
            map.put("floorSurcharge", breakdown.floorSurcharge());
            map.put("distanceSurcharge", breakdown.distanceSurcharge());
            map.put("otherSurcharges", breakdown.otherSurcharges());
            map.put("subtotal", breakdown.subtotal());
            map.put("total", breakdown.total());
            map.put("details", breakdown.details());
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert PriceBreakdown to JSON", e);
        }
    }

    @Override
    public PriceBreakdown convertToEntityAttribute(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            Map<String, Object> map = objectMapper.readValue(json, new TypeReference<>() {});

            return PriceBreakdown.builder()
                    .baseFee(getBigDecimal(map, "baseFee"))
                    .travelFee(getBigDecimal(map, "travelFee"))
                    .laborCost(getBigDecimal(map, "laborCost"))
                    .volumeCost(getBigDecimal(map, "volumeCost"))
                    .floorSurcharge(getBigDecimal(map, "floorSurcharge"))
                    .distanceSurcharge(getBigDecimal(map, "distanceSurcharge"))
                    .otherSurcharges(getBigDecimal(map, "otherSurcharges"))
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert JSON to PriceBreakdown", e);
        }
    }

    private BigDecimal getBigDecimal(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        return new BigDecimal(value.toString());
    }
}
