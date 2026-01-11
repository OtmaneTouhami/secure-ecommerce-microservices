package ma.enset.commandservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.commandservice.dto.OrderItemResponseDTO;
import ma.enset.commandservice.dto.OrderRequestDTO;
import ma.enset.commandservice.dto.OrderResponseDTO;
import ma.enset.commandservice.enums.OrderStatus;
import ma.enset.commandservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "APIs for managing orders")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Create a new order", description = "Create a new order with products. Only accessible by CLIENT role.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Order created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or insufficient stock"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<OrderResponseDTO> createOrder(
            @Valid @RequestBody OrderRequestDTO request,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        String username = jwt.getClaimAsString("preferred_username");
        log.info("User {} creating new order", username);

        OrderResponseDTO order = orderService.createOrder(request, userId, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Get my orders", description = "Retrieve all orders for the current user. Only accessible by CLIENT role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        log.info("User {} fetching their orders", jwt.getClaimAsString("preferred_username"));

        List<OrderResponseDTO> orders = orderService.getMyOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieve an order by its ID. Clients can only view their own orders, admins can view any order.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order found"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to view this order")
    })
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @PathVariable @Parameter(description = "Order ID") String id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        boolean isAdmin = hasRole(jwt, "ADMIN");
        log.info("User {} fetching order: {}", jwt.getClaimAsString("preferred_username"), id);

        OrderResponseDTO order = orderService.getOrderById(id, userId, isAdmin);
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders", description = "Retrieve all orders. Only accessible by ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders(
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Admin {} fetching all orders", jwt.getClaimAsString("preferred_username"));
        List<OrderResponseDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status", description = "Update the status of an order. Only accessible by ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable @Parameter(description = "Order ID") String id,
            @RequestParam @Parameter(description = "New order status") OrderStatus status,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Admin {} updating order {} status to {}", jwt.getClaimAsString("preferred_username"), id, status);
        OrderResponseDTO order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel an order", description = "Cancel an order. Clients can cancel their own pending orders, admins can cancel any pending order.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Order cancelled successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "400", description = "Cannot cancel order with current status"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to cancel this order")
    })
    public ResponseEntity<Void> cancelOrder(
            @PathVariable @Parameter(description = "Order ID") String id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        boolean isAdmin = hasRole(jwt, "ADMIN");
        log.info("User {} cancelling order: {}", jwt.getClaimAsString("preferred_username"), id);

        orderService.cancelOrder(id, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get orders by status", description = "Retrieve all orders with a specific status. Only accessible by ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByStatus(
            @PathVariable @Parameter(description = "Order status to filter by") OrderStatus status,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Admin {} fetching orders with status: {}", jwt.getClaimAsString("preferred_username"), status);
        List<OrderResponseDTO> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}/items")
    @Operation(summary = "Get order items", description = "Retrieve items for a specific order. Clients can only view items from their own orders.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order items retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - not authorized to view this order's items")
    })
    public ResponseEntity<List<OrderItemResponseDTO>> getOrderItems(
            @PathVariable @Parameter(description = "Order ID") String id,
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        boolean isAdmin = hasRole(jwt, "ADMIN");
        log.info("User {} fetching items for order: {}", jwt.getClaimAsString("preferred_username"), id);

        List<OrderItemResponseDTO> items = orderService.getOrderItems(id, userId, isAdmin);
        return ResponseEntity.ok(items);
    }

    private boolean hasRole(Jwt jwt, String role) {
        var realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null) {
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) realmAccess.get("roles");
            return roles != null && roles.contains(role);
        }
        return false;
    }
}
