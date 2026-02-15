package com.vinia.backend.service;

import com.vinia.backend.model.Usuario;
import com.vinia.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public Optional<Usuario> login(String username, String password) {
        Optional<Usuario> userOpt = usuarioRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            Usuario user = userOpt.get();
            // In a real app, use BCrypt or similar
            if (user.getPassword().equals(password) && user.isActivo()) {
                return Optional.of(user);
            }
        }
        return Optional.empty();
    }

    public Usuario register(Usuario usuario) {
        // In a real app, encrypt password here
        return usuarioRepository.save(usuario);
    }

    public void changePassword(String userId, String oldPassword, String newPassword) {
        Usuario user = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!user.getPassword().equals(oldPassword)) {
            throw new RuntimeException("Contraseña actual incorrecta");
        }

        user.setPassword(newPassword);
        usuarioRepository.save(user);
    }
}
