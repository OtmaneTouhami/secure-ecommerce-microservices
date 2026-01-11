package ma.enset.productservice.service;

import ma.enset.productservice.dto.ProductRequestDTO;
import ma.enset.productservice.dto.ProductResponseDTO;

import java.util.List;

public interface ProductService {

    ProductResponseDTO createProduct(ProductRequestDTO request);

    ProductResponseDTO getProductById(String id);

    List<ProductResponseDTO> getAllProducts();

    ProductResponseDTO updateProduct(String id, ProductRequestDTO request);

    void deleteProduct(String id);

    boolean checkStock(String productId, Integer quantity);

    void reduceStock(String productId, Integer quantity);

    List<ProductResponseDTO> searchProducts(String name);

    List<ProductResponseDTO> getInStockProducts();

    List<ProductResponseDTO> getLowStockProducts(Integer threshold);
}
