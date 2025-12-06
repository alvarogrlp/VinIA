package com.vinia.backend.controller;

import com.vinia.backend.model.Asignacion;
import com.vinia.backend.model.Cliente;
import com.vinia.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asignaciones")
@CrossOrigin(origins = "*")
public class AsignacionController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/comercial/{id}/clientes")
    public List<Map<String, Object>> getClientesComercial(@PathVariable String id) {
        return adminService.getClientesComercialDTO(id);
    }

    @GetMapping("/comercial/{id}/stats")
    public ResponseEntity<?> getEstadisticasComercial(@PathVariable String id) {
        return ResponseEntity.ok(adminService.getEstadisticasComercial(id));
    }

    @PostMapping
    public ResponseEntity<?> asignarCliente(@RequestBody Map<String, String> body) {
        try {
            Asignacion asignacion = adminService.asignarCliente(
                    body.get("clienteId"),
                    body.get("comercialId"),
                    body.get("adminId"));
            return ResponseEntity.ok(asignacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/desasignar")
    public ResponseEntity<?> desasignarCliente(@RequestBody Map<String, String> body) {
        adminService.desasignarCliente(
                body.get("clienteId"),
                body.get("comercialId"));
        return ResponseEntity.ok().build();
    }
}
