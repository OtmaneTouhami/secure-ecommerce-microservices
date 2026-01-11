package ma.enset.commandservice.exception;

public class ProductNotAvailableException extends RuntimeException {

    public ProductNotAvailableException(String productId) {
        super("Product not available: " + productId);
    }

    public ProductNotAvailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
