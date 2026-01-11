package ma.enset.productservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.productservice.dto.ProductRequestDTO;
import ma.enset.productservice.dto.ProductResponseDTO;
import ma.enset.productservice.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Product Management", description = "APIs for managing products")
@SecurityRequirement(name = "bearerAuth")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieve all products. Accessible by ADMIN and CLIENT roles.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Products retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden")
    })
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts(
            @AuthenticationPrincipal Jwt jwt) {
        log.info("User {} requesting all products", jwt.getSubject());
        List<ProductResponseDTO> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a product by its ID. Accessible by ADMIN and CLIENT roles.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product found"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ProductResponseDTO> getProductById(
            @PathVariable @Parameter(description = "Product ID") String id,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("User {} requesting product: {}", jwt.getSubject(), id);
        ProductResponseDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new product", description = "Create a new product. Only accessible by ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Product created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<ProductResponseDTO> createProduct(
            @Valid @RequestBody ProductRequestDTO request,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Admin {} creating new product: {}", jwt.getSubject(), request.name());
        ProductResponseDTO product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a product", description = "Update an existing product. Only accessible by ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable @Parameter(description = "Product ID") String id,
            @Valid @RequestBody ProductRequestDTO request,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Admin {} updating product: {}", jwt.getSubject(), id);
        ProductResponseDTO product = productService.updateProduct(id, request);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a product", description = "Delete a product by its ID. Only accessible by ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<Void> deleteProduct(
            @PathVariable @Parameter(description = "Product ID") String id,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Admin {} deleting product: {}", jwt.getSubject(), id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search products by name. Accessible by ADMIN and CLIENT roles.")
    public ResponseEntity<List<ProductResponseDTO>> searchProducts(
            @RequestParam @Parameter(description = "Search query for product name") String name,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("User {} searching products with name: {}", jwt.getSubject(), name);
        List<ProductResponseDTO> products = productService.searchProducts(name);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/in-stock")
    @Operation(summary = "Get in-stock products", description = "Retrieve all products with stock quantity greater than 0. Accessible by ADMIN and CLIENT roles.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "In-stock products retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ProductResponseDTO>> getInStockProducts(
            @AuthenticationPrincipal Jwt jwt) {
        log.info("User {} requesting in-stock products", jwt.getSubject());
        List<ProductResponseDTO> products = productService.getInStockProducts();
        return ResponseEntity.ok(products);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get low-stock products", description = "Retrieve products with stock at or below threshold. Only accessible by ADMIN role for inventory management.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Low-stock products retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<List<ProductResponseDTO>> getLowStockProducts(
            @RequestParam(defaultValue = "10") @Parameter(description = "Stock threshold (default: 10)") Integer threshold,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Admin {} requesting low-stock products with threshold: {}", jwt.getSubject(), threshold);
        List<ProductResponseDTO> products = productService.getLowStockProducts(threshold);
        return ResponseEntity.ok(products);
    }

    // Internal endpoints for inter-service communication
    @GetMapping("/{id}/check-stock")
    @Operation(summary = "Check product stock", description = "Check if product has sufficient stock. Used for inter-service communication.")
    public ResponseEntity<Boolean> checkStock(
            @PathVariable @Parameter(description = "Product ID") String id,
            @RequestParam @Parameter(description = "Quantity to check") Integer quantity) {
        log.debug("Stock check for product: {}, quantity: {}", id, quantity);
        boolean available = productService.checkStock(id, quantity);
        return ResponseEntity.ok(available);
    }

    @PutMapping("/{id}/reduce-stock")
    @Operation(summary = "Reduce product stock", description = "Reduce product stock after order. Used for inter-service communication.")
    public ResponseEntity<Void> reduceStock(
            @PathVariable @Parameter(description = "Product ID") String id,
            @RequestParam @Parameter(description = "Quantity to reduce") Integer quantity) {
        log.info("Reducing stock for product: {}, quantity: {}", id, quantity);
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok().build();
    }
}

