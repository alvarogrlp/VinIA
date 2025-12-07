package com.vinia.backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleJsonErrors(HttpMessageNotReadableException e) {
        System.err.println("JSON PARSE ERROR: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.badRequest().body("JSON Error: " + e.getMessage());
    }
}
