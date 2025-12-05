package com.vinia.backend.controller;

import com.vinia.backend.model.Cliente;
import com.vinia.backend.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    public List<Cliente> getAll(@RequestParam(required = false) String search) {
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
    public Cliente create(@RequestBody Cliente cliente) {
        return clienteService.save(cliente);
    }

    @PutMapping("/{id}")
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
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            clienteService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
