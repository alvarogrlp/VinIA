package com.vinia.backend.controller;

import com.vinia.backend.model.Usuario;
import com.vinia.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping
    public List<Usuario> getAll() {
        return usuarioRepository.findAll();
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<?> toggleStatus(@PathVariable String id, @RequestBody Map<String, Boolean> body) {
        return usuarioRepository.findById(id)
                .map(user -> {
                    user.setActivo(body.get("activo"));
                    usuarioRepository.save(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, String> body) {
        return usuarioRepository.findById(id)
                .map(user -> {
                    if (body.containsKey("nombre"))
                        user.setNombre(body.get("nombre"));
                    if (body.containsKey("apellidos"))
                        user.setApellidos(body.get("apellidos"));
                    if (body.containsKey("rol"))
                        user.setRol(body.get("rol"));
                    usuarioRepository.save(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (usuarioRepository.existsById(id)) {
            usuarioRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
