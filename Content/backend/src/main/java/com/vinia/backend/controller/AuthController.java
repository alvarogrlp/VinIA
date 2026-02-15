package com.vinia.backend.controller;

import com.vinia.backend.model.Usuario;
import com.vinia.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.vinia.backend.security.JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<Usuario> userOpt = authService.login(username, password);

        if (userOpt.isPresent()) {
            Usuario user = userOpt.get();
            Map<String, Object> response = new HashMap<>();

            // Generate REAL token
            String token = jwtUtils.generateTokenFromUsername(user.getUsername());

            // Return user info
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("nombre", user.getNombre());
            userInfo.put("apellidos", user.getApellidos());
            userInfo.put("rol", user.getRol());

            response.put("user", userInfo);
            response.put("token", token);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciales inválidas"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        try {
            return ResponseEntity.ok(authService.register(usuario));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of("message", "El nombre de usuario ya existe"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al crear el usuario: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> data) {
        try {
            authService.changePassword(
                    data.get("userId"),
                    data.get("oldPassword"),
                    data.get("newPassword"));
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
