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
    public List<Vino> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return vinoService.search(search);
        }
        return vinoService.findAll();
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
    @PreAuthorize("hasRole('ALMACEN')")
    public Vino create(@RequestBody Vino vino) {
        return vinoService.save(vino);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ALMACEN')")
    public ResponseEntity<Vino> update(@PathVariable String id, @RequestBody Vino vino) {
        try {
            Vino existing = vinoService.findById(id);
            vino.setId(id); // Ensure ID matches
            return ResponseEntity.ok(vinoService.save(vino));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ALMACEN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            vinoService.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/low-stock")
    public List<Vino> getLowStock(@RequestParam(defaultValue = "10") Integer threshold) {
        return vinoService.findLowStock(threshold);
    }
}
