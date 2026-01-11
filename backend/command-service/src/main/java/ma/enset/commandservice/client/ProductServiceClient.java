package ma.enset.commandservice.client;

import ma.enset.commandservice.config.FeignConfig;
import ma.enset.commandservice.dto.ProductDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service", configuration = FeignConfig.class)
public interface ProductServiceClient {

    @GetMapping("/api/products/{id}")
    ProductDTO getProductById(@PathVariable("id") String id);

    @GetMapping("/api/products/{id}/check-stock")
    Boolean checkStock(@PathVariable("id") String id, @RequestParam("quantity") Integer quantity);

    @PutMapping("/api/products/{id}/reduce-stock")
    void reduceStock(@PathVariable("id") String id, @RequestParam("quantity") Integer quantity);
}
