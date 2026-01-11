package ma.enset.productservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponseDTO(
        String id,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
