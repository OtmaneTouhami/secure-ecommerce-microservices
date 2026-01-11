package ma.enset.commandservice.dto;

import ma.enset.commandservice.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponseDTO(
        String id,
        String userId,
        String username,
        OrderStatus status,
        BigDecimal totalAmount,
        List<OrderItemResponseDTO> items,
        LocalDateTime orderDate,
        LocalDateTime updatedAt
) {
}
