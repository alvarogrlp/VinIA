package com.vinia.backend.controller;

import com.vinia.backend.model.Vino;
import com.vinia.backend.service.VinoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/vinos")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class VinoController {

    @Autowired
    private VinoService vinoService;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String search) {
        try {
            if (search != null && !search.isEmpty()) {
                return ResponseEntity.ok(vinoService.search(search));
            }
            return ResponseEntity.ok(vinoService.findAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error loading wines: " + (e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vino> getById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(vinoService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ALMACEN', 'ADMIN')")
    public Vino create(@RequestBody Vino vino) {
        return vinoService.save(vino);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ALMACEN', 'ADMIN')")
    public ResponseEntity<Vino> update(@PathVariable String id, @RequestBody Vino vino) {
        vino.setId(id); // Ensure ID matches
        return ResponseEntity.ok(vinoService.save(vino));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ALMACEN', 'ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            vinoService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ALMACEN', 'ADMIN')")
    public ResponseEntity<Vino> updateStock(@PathVariable String id,
            @RequestBody java.util.Map<String, Integer> payload) {
        Integer cantidad = payload.get("cantidad");
        if (cantidad == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(vinoService.updateStock(id, cantidad));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/low-stock")
    public List<Vino> getLowStock(@RequestParam(defaultValue = "10") Integer threshold) {
        return vinoService.findLowStock(threshold);
    }
}
