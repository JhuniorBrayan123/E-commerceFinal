package com.example.payment_service.exception;

import org.springframework.http.HttpStatus;

public class PaymentException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus status;

    private PaymentException(String errorCode, String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.status = status;
    }

    private PaymentException(String errorCode, String message, HttpStatus status) {
        this(errorCode, message, status, null);
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static PaymentException unauthorized(String code, String message) {
        return new PaymentException(code, message, HttpStatus.UNAUTHORIZED);
    }

    public static PaymentException conflict(String code, String message) {
        return new PaymentException(code, message, HttpStatus.CONFLICT);
    }

    public static PaymentException notFound(String code, String message) {
        return new PaymentException(code, message, HttpStatus.NOT_FOUND);
    }

    public static PaymentException badRequest(String code, String message) {
        return new PaymentException(code, message, HttpStatus.BAD_REQUEST);
    }

    public static PaymentException gatewayError(String code, String message, Throwable cause) {
        return new PaymentException(code, message, HttpStatus.BAD_GATEWAY, cause);
    }

    public static PaymentException gatewayError(String code, String message) {
        return new PaymentException(code, message, HttpStatus.BAD_GATEWAY);
    }
}

