package ma.enset.commandservice.exception;

public class OrderNotFoundException extends RuntimeException {

    public OrderNotFoundException(String id) {
        super("Order not found with id: " + id);
    }

    public OrderNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
