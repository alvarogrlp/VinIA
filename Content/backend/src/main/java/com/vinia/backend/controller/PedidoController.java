package com.vinia.backend.controller;

import com.vinia.backend.model.Pedido;
import com.vinia.backend.service.PedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

/**
 * REST Controller for managing Orders (Pedidos).
 * Provides endpoints for creating, retrieving, updating, and deleting orders,
 * as well as managing order status.
 */
@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    /**
     * Retrieves all orders, optionally filtered by client ID.
     * 
     * @param clienteId Optional ID of the client to filter orders by.
     * @return List of orders.
     */
    @GetMapping
    public List<Pedido> getAll(@RequestParam(required = false) String clienteId) {
        if (clienteId != null && !clienteId.isEmpty()) {
            return pedidoService.findByCliente(clienteId);
        }
        return pedidoService.findAll();
    }

    /**
     * Retrieves a specific order by its ID.
     * 
     * @param id The ID of the order.
     * @return The order object if found, or 404 Not Found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> getById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(pedidoService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Creates a new order.
     * 
     * @param pedido The order object to create.
     * @return The created order wrapped in ResponseEntity.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody Pedido pedido) {
        try {
            return ResponseEntity.ok(pedidoService.createPedido(pedido));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body("Error creating order: " + (e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    /**
     * Updates the status of an existing order.
     * 
     * @param id     The ID of the order.
     * @param estado The new status string (or JSON containing status).
     * @return The updated order.
     */
    @PostMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'ALMACEN', 'REPARTIDOR', 'COMERCIAL')")
    public ResponseEntity<Pedido> updateStatus(@PathVariable String id, @RequestBody String estado) {
        try {
            // Simple parsing if body is just the string or JSON
            if (estado.contains(":")) {
                // Assume JSON {"estado": "..."} - simplified parsing
                estado = estado.split(":")[1].replaceAll("[\"}]", "").trim();
            }
            return ResponseEntity.ok(pedidoService.updateStatus(id, estado));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Updates an entire existing order.
     * 
     * @param id     The ID of the order to update.
     * @param pedido The updated order object.
     * @return The updated order.
     */
    @PostMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    public ResponseEntity<Pedido> update(@PathVariable String id, @RequestBody Pedido pedido) {
        try {
            return ResponseEntity.ok(pedidoService.updatePedido(id, pedido));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Deletes an order by its ID.
     * 
     * @param id The ID of the order to delete.
     * @return 200 OK if successful, or 404 Not Found.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            pedidoService.deletePedido(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
