package com.example.payment_service.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpStatusCodeException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorResponse> handlePaymentException(PaymentException ex, HttpServletRequest request) {
        return buildResponse(ex.getStatus(), ex.getMessage(), ex.getErrorCode(), request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        StringBuilder builder = new StringBuilder();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            builder.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; ");
        }
        return buildResponse(HttpStatus.BAD_REQUEST, builder.toString(), "VALIDATION_ERROR", request.getRequestURI());
    }

    @ExceptionHandler(HttpStatusCodeException.class)
    public ResponseEntity<ErrorResponse> handleGateway(HttpStatusCodeException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_GATEWAY, ex.getResponseBodyAsString(), "GATEWAY_ERROR", request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage(), "UNEXPECTED_ERROR", request.getRequestURI());
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String code, String path) {
        ErrorResponse error = new ErrorResponse(LocalDateTime.now(), message, path, code);
        return ResponseEntity.status(status).body(error);
    }
}

