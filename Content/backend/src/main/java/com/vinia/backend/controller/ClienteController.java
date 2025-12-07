package com.vinia.backend.controller;

import com.vinia.backend.model.Cliente;
import com.vinia.backend.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private com.vinia.backend.service.AdminService adminService;

    @Autowired
    private com.vinia.backend.repository.PedidoRepository pedidoRepository;

    @GetMapping
    public List<Cliente> getAll(@RequestParam(required = false) String search,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {
        if ("Comercial".equals(role) && userId != null) {
            List<Cliente> clientes = adminService.getClientesComercial(userId);
            if (search != null && !search.isEmpty()) {
                String q = search.toLowerCase();
                return clientes.stream()
                        .filter(c -> (c.getNombre() != null && c.getNombre().toLowerCase().contains(q)) ||
                                (c.getCif() != null && c.getCif().toLowerCase().contains(q)) ||
                                (c.getEmail() != null && c.getEmail().toLowerCase().contains(q)))
                        .collect(java.util.stream.Collectors.toList());
            }
            return clientes;
        }

        if (search != null && !search.isEmpty()) {
            return clienteService.search(search);
        }
        return clienteService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> getById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(clienteService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    public Cliente create(@RequestBody Cliente cliente) {
        return clienteService.save(cliente);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMERCIAL')")
    public ResponseEntity<Cliente> update(@PathVariable String id, @RequestBody Cliente cliente) {
        try {
            Cliente existing = clienteService.findById(id);
            cliente.setId(id);
            return ResponseEntity.ok(clienteService.save(cliente));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            clienteService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/pedidos")
    public ResponseEntity<?> getPedidosByCliente(@PathVariable String id) {
        try {
            return ResponseEntity.ok(pedidoRepository.findByClienteIdOrderByFechaDesc(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
