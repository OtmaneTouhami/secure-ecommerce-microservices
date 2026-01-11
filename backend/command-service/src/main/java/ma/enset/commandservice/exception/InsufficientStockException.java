package ma.enset.commandservice.exception;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(String productId, Integer requested) {
        super(String.format("Insufficient stock for product %s. Requested: %d", productId, requested));
    }

    public InsufficientStockException(String message) {
        super(message);
    }
}
