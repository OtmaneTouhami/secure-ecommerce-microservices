package ma.enset.productservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.productservice.dto.ProductRequestDTO;
import ma.enset.productservice.dto.ProductResponseDTO;
import ma.enset.productservice.entity.Product;
import ma.enset.productservice.exception.InsufficientStockException;
import ma.enset.productservice.exception.ProductNotFoundException;
import ma.enset.productservice.mapper.ProductMapper;
import ma.enset.productservice.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponseDTO createProduct(ProductRequestDTO request) {
        log.info("Creating new product: {}", request.name());
        Product product = productMapper.toEntity(request);
        Product savedProduct = productRepository.save(product);
        log.info("Product created with id: {}", savedProduct.getId());
        return productMapper.toResponseDTO(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(String id) {
        log.debug("Fetching product by id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return productMapper.toResponseDTO(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        log.debug("Fetching all products");
        List<Product> products = productRepository.findAll();
        return productMapper.toResponseDTOList(products);
    }

    @Override
    public ProductResponseDTO updateProduct(String id, ProductRequestDTO request) {
        log.info("Updating product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        
        productMapper.updateEntityFromDTO(request, product);
        Product updatedProduct = productRepository.save(product);
        log.info("Product updated: {}", id);
        return productMapper.toResponseDTO(updatedProduct);
    }

    @Override
    public void deleteProduct(String id) {
        log.info("Deleting product with id: {}", id);
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
        log.info("Product deleted: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkStock(String productId, Integer quantity) {
        log.debug("Checking stock for product: {}, quantity: {}", productId, quantity);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        boolean available = product.getStockQuantity() >= quantity;
        log.debug("Stock check result for {}: {}", productId, available);
        return available;
    }

    @Override
    public void reduceStock(String productId, Integer quantity) {
        log.info("Reducing stock for product: {}, quantity: {}", productId, quantity);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
        
        if (product.getStockQuantity() < quantity) {
            throw new InsufficientStockException(productId, quantity, product.getStockQuantity());
        }
        
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
        log.info("Stock reduced for product: {}. New stock: {}", productId, product.getStockQuantity());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> searchProducts(String name) {
        log.debug("Searching products by name: {}", name);
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        return productMapper.toResponseDTOList(products);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getInStockProducts() {
        log.debug("Fetching all in-stock products");
        List<Product> products = productRepository.findByStockQuantityGreaterThan(0);
        return productMapper.toResponseDTOList(products);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getLowStockProducts(Integer threshold) {
        log.debug("Fetching low-stock products with threshold: {}", threshold);
        List<Product> products = productRepository.findByStockQuantityLessThanEqual(threshold);
        return productMapper.toResponseDTOList(products);
    }
}

