package E_Auction.platform.exceptions.exceptionHandler;

import E_Auction.platform.exceptions.InvalidOperationException;
import E_Auction.platform.exceptions.InvalidBidException;
import E_Auction.platform.exceptions.ResourceNotFoundException;
import E_Auction.platform.exceptions.UserNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler
{
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex, WebRequest request) {
        return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request.getDescription(false));
    }

    @ExceptionHandler(InvalidBidException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidBid(InvalidBidException ex, WebRequest request) {
        return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, request.getDescription(false));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobal(Exception ex, WebRequest request) {
        return buildResponse("Internal Server Error", HttpStatus.INTERNAL_SERVER_ERROR, request.getDescription(false));
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String,Object>> handleUserNotFound(UserNotFoundException ex, WebRequest request)
    {
        return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request.getDescription(false));
    }

    @ExceptionHandler(InvalidOperationException.class)
    public ResponseEntity<Map<String,Object>> handleUserNotFound(InvalidOperationException ex, WebRequest request)
    {
        return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND, request.getDescription(false));
    }


    private ResponseEntity<Map<String, Object>> buildResponse(String message, HttpStatus status, String path) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", status.value());
        error.put("error", status.getReasonPhrase());
        error.put("message", message);
        error.put("path", path.replace("uri=", ""));
        return new ResponseEntity<>(error, status);
    }
}
