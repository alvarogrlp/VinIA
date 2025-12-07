package com.vinia.backend.security;

import com.vinia.backend.model.Usuario;
import com.vinia.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        // Map roles to authorities (simplified)
        // 'Administración' -> ROLE_ADMIN
        // 'Almacén' -> ROLE_ALMACEN
        // 'Comercial' -> ROLE_COMERCIAL

        String roleName = "ROLE_" + mapRole(usuario.getRol());

        return new User(
                usuario.getUsername(),
                usuario.getPassword(), // Should be encoded
                usuario.isActivo(),
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority(roleName)));
    }

    private String mapRole(String displayRole) {
        if (displayRole == null)
            return "USER";
        switch (displayRole) {
            case "Administración":
            case "Administracion":
                return "ADMIN";
            case "Almacén":
            case "Almacen":
                return "ALMACEN";
            case "Comercial":
                return "COMERCIAL";
            default:
                return displayRole.toUpperCase();
        }
    }
}
