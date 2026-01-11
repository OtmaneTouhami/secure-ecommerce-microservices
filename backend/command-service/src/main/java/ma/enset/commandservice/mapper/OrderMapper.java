package ma.enset.commandservice.mapper;

import ma.enset.commandservice.dto.OrderItemResponseDTO;
import ma.enset.commandservice.dto.OrderResponseDTO;
import ma.enset.commandservice.entity.Order;
import ma.enset.commandservice.entity.OrderItem;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderResponseDTO toResponseDTO(Order order);

    List<OrderResponseDTO> toResponseDTOList(List<Order> orders);

    OrderItemResponseDTO toOrderItemResponseDTO(OrderItem orderItem);

    List<OrderItemResponseDTO> toOrderItemResponseDTOList(List<OrderItem> orderItems);
}
