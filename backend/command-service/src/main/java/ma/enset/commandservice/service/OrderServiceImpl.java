package ma.enset.commandservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.commandservice.client.ProductServiceClient;
import ma.enset.commandservice.dto.OrderItemRequestDTO;
import ma.enset.commandservice.dto.OrderItemResponseDTO;
import ma.enset.commandservice.dto.OrderRequestDTO;
import ma.enset.commandservice.dto.OrderResponseDTO;
import ma.enset.commandservice.dto.ProductDTO;
import ma.enset.commandservice.entity.Order;
import ma.enset.commandservice.entity.OrderItem;
import ma.enset.commandservice.enums.OrderStatus;
import ma.enset.commandservice.exception.InsufficientStockException;
import ma.enset.commandservice.exception.OrderNotFoundException;
import ma.enset.commandservice.exception.ProductNotAvailableException;
import ma.enset.commandservice.exception.UnauthorizedOrderAccessException;
import ma.enset.commandservice.mapper.OrderMapper;
import ma.enset.commandservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ProductServiceClient productServiceClient;

    @Override
    public OrderResponseDTO createOrder(OrderRequestDTO request, String userId, String username) {
        log.info("Creating order for user: {}", username);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Validate products and calculate totals
        for (OrderItemRequestDTO itemRequest : request.items()) {
            // Get product details from Product Service
            ProductDTO product;
            try {
                product = productServiceClient.getProductById(itemRequest.productId());
            } catch (Exception e) {
                log.error("Failed to fetch product {}: {}", itemRequest.productId(), e.getMessage());
                throw new ProductNotAvailableException(itemRequest.productId());
            }

            if (product == null) {
                throw new ProductNotAvailableException(itemRequest.productId());
            }

            // Check stock availability
            Boolean hasStock;
            try {
                hasStock = productServiceClient.checkStock(itemRequest.productId(), itemRequest.quantity());
            } catch (Exception e) {
                log.error("Failed to check stock for product {}: {}", itemRequest.productId(), e.getMessage());
                throw new ProductNotAvailableException(itemRequest.productId());
            }

            if (hasStock == null || !hasStock) {
                throw new InsufficientStockException(itemRequest.productId(), itemRequest.quantity());
            }

            // Create order item
            BigDecimal subtotal = product.price().multiply(BigDecimal.valueOf(itemRequest.quantity()));
            OrderItem orderItem = OrderItem.builder()
                    .productId(product.id())
                    .productName(product.name())
                    .quantity(itemRequest.quantity())
                    .unitPrice(product.price())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(subtotal);
        }

        // Create order
        Order order = Order.builder()
                .userId(userId)
                .username(username)
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .build();

        // Add items to order
        for (OrderItem item : orderItems) {
            order.addItem(item);
        }

        // Save order first
        Order savedOrder = orderRepository.save(order);
        log.info("Order created with id: {}", savedOrder.getId());

        // Reduce stock for each product
        for (OrderItemRequestDTO itemRequest : request.items()) {
            try {
                productServiceClient.reduceStock(itemRequest.productId(), itemRequest.quantity());
                log.info("Stock reduced for product: {}", itemRequest.productId());
            } catch (Exception e) {
                log.error("Failed to reduce stock for product {}: {}", itemRequest.productId(), e.getMessage());
                // Note: In a production system, you would implement compensation/rollback
            }
        }

        // Update order status to CONFIRMED
        savedOrder.setStatus(OrderStatus.CONFIRMED);
        savedOrder = orderRepository.save(savedOrder);
        log.info("Order {} confirmed", savedOrder.getId());

        return orderMapper.toResponseDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrderById(String orderId, String userId, boolean isAdmin) {
        log.debug("Fetching order: {} for user: {}", orderId, userId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        // Check authorization: admin can view any order, client can only view their own
        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new UnauthorizedOrderAccessException(orderId, userId);
        }

        return orderMapper.toResponseDTO(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getMyOrders(String userId) {
        log.debug("Fetching orders for user: {}", userId);
        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        return orderMapper.toResponseDTOList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        log.debug("Fetching all orders");
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();
        return orderMapper.toResponseDTOList(orders);
    }

    @Override
    public OrderResponseDTO updateOrderStatus(String orderId, OrderStatus status) {
        log.info("Updating order {} status to {}", orderId, status);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated to {}", orderId, status);

        return orderMapper.toResponseDTO(updatedOrder);
    }

    @Override
    public void cancelOrder(String orderId, String userId, boolean isAdmin) {
        log.info("Cancelling order: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        // Check authorization
        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new UnauthorizedOrderAccessException(orderId, userId);
        }

        // Only allow cancellation of PENDING or CONFIRMED orders
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot cancel order with status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.info("Order {} cancelled", orderId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getOrdersByStatus(OrderStatus status) {
        log.debug("Fetching orders by status: {}", status);
        List<Order> orders = orderRepository.findByStatus(status);
        return orderMapper.toResponseDTOList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemResponseDTO> getOrderItems(String orderId, String userId, boolean isAdmin) {
        log.debug("Fetching order items for order: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        // Check authorization
        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new UnauthorizedOrderAccessException(orderId, userId);
        }

        return orderMapper.toOrderItemResponseDTOList(order.getItems());
    }
}

