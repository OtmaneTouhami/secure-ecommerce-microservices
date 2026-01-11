package ma.enset.productservice.repository;

import ma.enset.productservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByStockQuantityGreaterThan(Integer quantity);

    List<Product> findByStockQuantityLessThanEqual(Integer quantity);
}
