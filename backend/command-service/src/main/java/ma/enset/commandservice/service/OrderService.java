package ma.enset.commandservice.service;

import ma.enset.commandservice.dto.OrderItemResponseDTO;
import ma.enset.commandservice.dto.OrderRequestDTO;
import ma.enset.commandservice.dto.OrderResponseDTO;
import ma.enset.commandservice.enums.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponseDTO createOrder(OrderRequestDTO request, String userId, String username);

    OrderResponseDTO getOrderById(String orderId, String userId, boolean isAdmin);

    List<OrderResponseDTO> getMyOrders(String userId);

    List<OrderResponseDTO> getAllOrders();

    List<OrderResponseDTO> getOrdersByStatus(OrderStatus status);

    OrderResponseDTO updateOrderStatus(String orderId, OrderStatus status);

    void cancelOrder(String orderId, String userId, boolean isAdmin);

    List<OrderItemResponseDTO> getOrderItems(String orderId, String userId, boolean isAdmin);
}

