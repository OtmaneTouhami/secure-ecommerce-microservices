package ma.enset.productservice.exception;

public class InsufficientStockException extends RuntimeException {
    
    public InsufficientStockException(String productId, Integer requested, Integer available) {
        super(String.format("Insufficient stock for product %s. Requested: %d, Available: %d", 
                productId, requested, available));
    }
    
    public InsufficientStockException(String message) {
        super(message);
    }
}
