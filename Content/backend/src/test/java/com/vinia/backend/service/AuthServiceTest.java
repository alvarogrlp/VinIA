package com.vinia.backend.service;

import com.vinia.backend.model.Usuario;
import com.vinia.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthService.
 * 
 * Covers login validation, user registration,
 * and password change functionality.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AuthService authService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setId("u1");
        usuario.setNombre("Carlos");
        usuario.setApellidos("González");
        usuario.setUsername("carlos");
        usuario.setPassword("pass123");
        usuario.setRol("Comercial");
        usuario.setActivo(true);
    }

    @Nested
    @DisplayName("login()")
    class Login {
        @Test
        @DisplayName("Debe autenticar con credenciales válidas")
        void debeAutenticarConCredencialesValidas() {
            when(usuarioRepository.findByUsername("carlos")).thenReturn(Optional.of(usuario));

            Optional<Usuario> result = authService.login("carlos", "pass123");

            assertTrue(result.isPresent());
            assertEquals("carlos", result.get().getUsername());
        }

        @Test
        @DisplayName("Debe rechazar contraseña incorrecta")
        void debeRechazarContrasenaIncorrecta() {
            when(usuarioRepository.findByUsername("carlos")).thenReturn(Optional.of(usuario));

            Optional<Usuario> result = authService.login("carlos", "wrongpass");

            assertFalse(result.isPresent());
        }

        @Test
        @DisplayName("Debe rechazar usuario inexistente")
        void debeRechazarUsuarioInexistente() {
            when(usuarioRepository.findByUsername("noexiste")).thenReturn(Optional.empty());

            Optional<Usuario> result = authService.login("noexiste", "pass123");

            assertFalse(result.isPresent());
        }

        @Test
        @DisplayName("Debe rechazar usuario inactivo")
        void debeRechazarUsuarioInactivo() {
            usuario.setActivo(false);
            when(usuarioRepository.findByUsername("carlos")).thenReturn(Optional.of(usuario));

            Optional<Usuario> result = authService.login("carlos", "pass123");

            assertFalse(result.isPresent());
        }
    }

    @Nested
    @DisplayName("register()")
    class Register {
        @Test
        @DisplayName("Debe registrar un nuevo usuario")
        void debeRegistrarNuevoUsuario() {
            when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

            Usuario result = authService.register(usuario);

            assertNotNull(result);
            assertEquals("carlos", result.getUsername());
            verify(usuarioRepository).save(usuario);
        }
    }

    @Nested
    @DisplayName("changePassword()")
    class ChangePassword {
        @Test
        @DisplayName("Debe cambiar contraseña con validación correcta")
        void debeCambiarContrasena() {
            when(usuarioRepository.findById("u1")).thenReturn(Optional.of(usuario));
            when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

            authService.changePassword("u1", "pass123", "newPass456");

            assertEquals("newPass456", usuario.getPassword());
            verify(usuarioRepository).save(usuario);
        }

        @Test
        @DisplayName("Debe rechazar si contraseña actual es incorrecta")
        void debeRechazarSiContrasenaActualIncorrecta() {
            when(usuarioRepository.findById("u1")).thenReturn(Optional.of(usuario));

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> authService.changePassword("u1", "wrongOld", "newPass"));
            assertEquals("Contraseña actual incorrecta", ex.getMessage());
        }

        @Test
        @DisplayName("Debe lanzar excepción si usuario no existe")
        void debeLanzarExcepcionSiUsuarioNoExiste() {
            when(usuarioRepository.findById("inexistente")).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class,
                    () -> authService.changePassword("inexistente", "old", "new"));
        }
    }
}
