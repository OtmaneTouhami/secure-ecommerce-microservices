package ma.enset.commandservice.dto;

import java.math.BigDecimal;

public record ProductDTO(
        String id,
        String name,
        String description,
        BigDecimal price,
        Integer stockQuantity
) {
}
