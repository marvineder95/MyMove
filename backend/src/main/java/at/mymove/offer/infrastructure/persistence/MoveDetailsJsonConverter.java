package at.mymove.offer.infrastructure.persistence;

import at.mymove.move.domain.MoveDetails;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class MoveDetailsJsonConverter implements AttributeConverter<MoveDetails, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper().findAndRegisterModules();

    @Override
    public String convertToDatabaseColumn(MoveDetails attribute) {
        if (attribute == null) return null;
        try {
            return MAPPER.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not serialize MoveDetails", e);
        }
    }

    @Override
    public MoveDetails convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return null;
        try {
            return MAPPER.readValue(dbData, MoveDetails.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not deserialize MoveDetails", e);
        }
    }
}