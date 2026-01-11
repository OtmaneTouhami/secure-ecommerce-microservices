package ma.enset.commandservice.exception;

public class UnauthorizedOrderAccessException extends RuntimeException {

    public UnauthorizedOrderAccessException(String orderId, String userId) {
        super(String.format("User %s is not authorized to access order %s", userId, orderId));
    }

    public UnauthorizedOrderAccessException(String message) {
        super(message);
    }
}
