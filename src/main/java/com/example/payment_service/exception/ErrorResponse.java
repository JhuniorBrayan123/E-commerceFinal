package com.example.payment_service.exception;

import java.time.LocalDateTime;

public class ErrorResponse {

    private LocalDateTime timestamp;
    private String message;
    private String path;
    private String errorCode;

    public ErrorResponse(LocalDateTime timestamp, String message, String path, String errorCode) {
        this.timestamp = timestamp;
        this.message = message;
        this.path = path;
        this.errorCode = errorCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public String getErrorCode() {
        return errorCode;
    }
}

