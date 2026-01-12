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
    public ResponseEntity<?> getAll(@RequestParam(required = false) String search,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role) {

        if ("Comercial".equals(role) && userId != null) {
            List<Cliente> clientes = adminService.getClientesComercial(userId);
            if (search != null && !search.isEmpty()) {
                String q = search.toLowerCase();
                clientes = clientes.stream()
                        .filter(c -> (c.getNombre() != null && c.getNombre().toLowerCase().contains(q)) ||
                                (c.getCif() != null && c.getCif().toLowerCase().contains(q)) ||
                                (c.getEmail() != null && c.getEmail().toLowerCase().contains(q)))
                        .collect(java.util.stream.Collectors.toList());
            }
            return ResponseEntity.ok(clientes);
        }

        // If admin, return clients with their assignment status
        if ("Administración".equals(role)) {
            java.util.List<java.util.Map<String, Object>> enrichedClients = clienteService.findAll().stream().map(c -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", c.getId());
                map.put("nombre", c.getNombre());
                map.put("cif", c.getCif());
                map.put("tipo", c.getTipo());
                map.put("ciudad", c.getCiudad());
                map.put("provincia", c.getProvincia());
                map.put("direccion", c.getDireccion());
                map.put("telefono", c.getTelefono());
                map.put("email", c.getEmail());
                map.put("activo", c.isActivo());
                map.put("created_at", c.getCreatedAt());

                // Fetch assignment
                try {
                    com.vinia.backend.model.Asignacion asignacion = adminService.getAsignacionByCliente(c.getId());
                    if (asignacion != null) {
                        map.put("comercial_nombre",
                                asignacion.getComercial().getNombre() + " " + asignacion.getComercial().getApellidos());
                        map.put("comercial_id", asignacion.getComercial().getId());
                    }
                } catch (Exception e) {
                }

                return map;
            }).collect(java.util.stream.Collectors.toList());

            if (search != null && !search.isEmpty()) {
                String q = search.toLowerCase();
                enrichedClients = enrichedClients.stream()
                        .filter(m -> (m.get("nombre") != null && m.get("nombre").toString().toLowerCase().contains(q))
                                ||
                                (m.get("cif") != null && m.get("cif").toString().toLowerCase().contains(q)))
                        .collect(java.util.stream.Collectors.toList());
            }

            return ResponseEntity.ok(enrichedClients);
        }

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(clienteService.search(search));
        }
        return ResponseEntity.ok(clienteService.findAll());
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
