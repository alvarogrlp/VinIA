package com.vinia.backend.controller;

import com.vinia.backend.model.Pedido;
import com.vinia.backend.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
// Controller for managing orders (Pedidos)
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @GetMapping
    public List<Pedido> getAll(@RequestParam(required = false) String clienteId) {
        if (clienteId != null && !clienteId.isEmpty()) {
            return pedidoService.findByCliente(clienteId);
        }
        return pedidoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(pedidoService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody Pedido pedido) {
        try {
            return ResponseEntity.ok(pedidoService.createPedido(pedido));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body("Error creando pedido: " + (e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALMACEN', 'REPARTIDOR')")
    public ResponseEntity<Pedido> updateStatus(@PathVariable String id, @RequestBody String estado) {
        try {
            // Simple parsing if body is just the string or JSON
            if (estado.contains(":")) {
                // Assume JSON {"estado": "..."} - simplified parsing
                estado = estado.split(":")[1].replaceAll("[\"}]", "").trim();
            }
            return ResponseEntity.ok(pedidoService.updateStatus(id, estado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
