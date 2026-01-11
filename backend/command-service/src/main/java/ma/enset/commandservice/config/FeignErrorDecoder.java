package ma.enset.commandservice.config;

import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import ma.enset.commandservice.exception.InsufficientStockException;
import ma.enset.commandservice.exception.ProductNotAvailableException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Slf4j
@Component
public class FeignErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultErrorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        String requestUrl = response.request().url();
        HttpStatus status = HttpStatus.resolve(response.status());
        String responseBody = getResponseBody(response);

        log.error("Feign error - Method: {}, URL: {}, Status: {}, Body: {}",
                methodKey, requestUrl, response.status(), responseBody);

        if (status == null) {
            return defaultErrorDecoder.decode(methodKey, response);
        }

        return switch (status) {
            case NOT_FOUND -> {
                if (requestUrl.contains("/api/products/")) {
                    String productId = extractProductId(requestUrl);
                    yield new ProductNotAvailableException(productId);
                }
                yield defaultErrorDecoder.decode(methodKey, response);
            }
            case BAD_REQUEST -> {
                if (responseBody.contains("Insufficient stock") || responseBody.contains("insufficient-stock")) {
                    yield new InsufficientStockException("Product stock is insufficient for this order");
                }
                yield new RuntimeException("Bad request: " + responseBody);
            }
            case UNAUTHORIZED, FORBIDDEN -> 
                new RuntimeException("Access denied to Product Service. Check JWT token propagation.");
            case SERVICE_UNAVAILABLE, GATEWAY_TIMEOUT -> 
                new RuntimeException("Product Service is temporarily unavailable. Please try again later.");
            default -> defaultErrorDecoder.decode(methodKey, response);
        };
    }

    private String getResponseBody(Response response) {
        if (response.body() == null) {
            return "";
        }
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(response.body().asInputStream(), StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        } catch (IOException e) {
            log.warn("Failed to read response body", e);
            return "";
        }
    }

    private String extractProductId(String url) {
        // Extract product ID from URL like /api/products/{id}/...
        String[] parts = url.split("/api/products/");
        if (parts.length > 1) {
            String afterProducts = parts[1];
            int slashIndex = afterProducts.indexOf('/');
            int questionIndex = afterProducts.indexOf('?');
            int endIndex = afterProducts.length();
            
            if (slashIndex > 0) endIndex = Math.min(endIndex, slashIndex);
            if (questionIndex > 0) endIndex = Math.min(endIndex, questionIndex);
            
            return afterProducts.substring(0, endIndex);
        }
        return "unknown";
    }
}
