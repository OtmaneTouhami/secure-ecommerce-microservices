package ma.enset.commandservice.dto;

import java.math.BigDecimal;

public record OrderItemResponseDTO(
        Long id,
        String productId,
        String productName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
}
