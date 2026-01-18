package com.vinia.backend.controller;

import com.vinia.backend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor

public class AIController {

    private final AIService aiService;

    @GetMapping("/recommendations/{clienteId}")
    public ResponseEntity<String> getRecommendations(@PathVariable String clienteId) {
        return ResponseEntity.ok(aiService.getRecommendations(clienteId));
    }

    @PostMapping("/parse-order")
    public ResponseEntity<String> parseOrder(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        return ResponseEntity.ok(aiService.parseOrderFromText(text));
    }

    @GetMapping("/insights/{clienteId}")
    public ResponseEntity<String> getInsights(@PathVariable String clienteId) {
        return ResponseEntity.ok(aiService.analyzeCustomerInsights(clienteId));
    }

    @GetMapping("/search")
    public ResponseEntity<String> semanticSearch(@RequestParam String query) {
        return ResponseEntity.ok(aiService.semanticSearch(query));
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        String context = payload.get("context");
        return ResponseEntity.ok(aiService.chat(message, context));
    }
}
