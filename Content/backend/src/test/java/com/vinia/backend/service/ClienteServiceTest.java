package com.vinia.backend.service;

import com.vinia.backend.model.*;
import com.vinia.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ClienteService.
 * 
 * Covers client CRUD operations, zone-based commercial assignment,
 * soft delete, and search functionality.
 */
@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AsignacionRepository asignacionRepository;

    @InjectMocks
    private ClienteService clienteService;

    private Cliente cliente;
    private Usuario comercialNorte;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setId("c1");
        cliente.setNombre("Restaurante El Calderito");
        cliente.setCif("B12345678");
        cliente.setTipo("Restaurante");
        cliente.setDireccion("Calle Falsa 123");
        cliente.setCiudad("Santa Cruz");
        cliente.setCodigoPostal("38001");
        cliente.setProvincia("Santa Cruz de Tenerife");
        cliente.setZona("Norte");
        cliente.setTelefono("922123456");
        cliente.setEmail("calderito@test.com");
        cliente.setPersonaContacto("Juan Pérez");
        cliente.setActivo(true);

        comercialNorte = new Usuario();
        comercialNorte.setId("u-carlos");
        comercialNorte.setNombre("Carlos");
        comercialNorte.setApellidos("González");
        comercialNorte.setUsername("carlos");
        comercialNorte.setRol("Comercial");
    }

    @Nested
    @DisplayName("findAll()")
    class FindAll {
        @Test
        @DisplayName("Debe devolver solo clientes activos")
        void debeRetornarSoloActivos() {
            when(clienteRepository.findByActivoTrue()).thenReturn(List.of(cliente));

            List<Cliente> result = clienteService.findAll();

            assertEquals(1, result.size());
            assertTrue(result.get(0).isActivo());
            verify(clienteRepository).findByActivoTrue();
        }

        @Test
        @DisplayName("Debe devolver lista vacía si no hay clientes activos")
        void debeRetornarListaVacia() {
            when(clienteRepository.findByActivoTrue()).thenReturn(Collections.emptyList());

            List<Cliente> result = clienteService.findAll();

            assertTrue(result.isEmpty());
        }
    }

    @Nested
    @DisplayName("findById()")
    class FindById {
        @Test
        @DisplayName("Debe encontrar cliente por ID")
        void debeEncontrarClientePorId() {
            when(clienteRepository.findById("c1")).thenReturn(Optional.of(cliente));

            Cliente result = clienteService.findById("c1");

            assertEquals("Restaurante El Calderito", result.getNombre());
        }

        @Test
        @DisplayName("Debe lanzar excepción si cliente no existe")
        void debeLanzarExcepcionSiNoExiste() {
            when(clienteRepository.findById("inexistente")).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> clienteService.findById("inexistente"));
        }
    }

    @Nested
    @DisplayName("save()")
    class Save {
        @Test
        @DisplayName("Debe guardar nuevo cliente y asignar comercial por zona Norte")
        void debeGuardarYAsignarComercialZonaNorte() {
            cliente.setId(null); // New client
            when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);
            when(usuarioRepository.findByUsername("carlos")).thenReturn(Optional.of(comercialNorte));

            Cliente result = clienteService.save(cliente);

            assertNotNull(result);
            verify(asignacionRepository).save(any(Asignacion.class));
        }

        @Test
        @DisplayName("Debe guardar cliente existente sin reasignar comercial")
        void debeGuardarClienteExistenteSinReasignar() {
            // Existing client (has ID)
            when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);

            Cliente result = clienteService.save(cliente);

            assertNotNull(result);
            verify(asignacionRepository, never()).save(any(Asignacion.class));
        }

        @Test
        @DisplayName("Debe asignar comercial Laura para zona Santa Cruz")
        void debeAsignarComercialZonaSantaCruz() {
            cliente.setId(null);
            cliente.setZona("Santa Cruz");
            Usuario laura = new Usuario();
            laura.setId("u-laura");
            laura.setUsername("laura");

            when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);
            when(usuarioRepository.findByUsername("laura")).thenReturn(Optional.of(laura));

            clienteService.save(cliente);

            verify(asignacionRepository).save(argThat(a -> a.getComercial().getUsername().equals("laura")));
        }
    }

    @Nested
    @DisplayName("deleteById()")
    class DeleteById {
        @Test
        @DisplayName("Debe desactivar cliente (soft delete)")
        void debeDesactivarCliente() {
            when(clienteRepository.findById("c1")).thenReturn(Optional.of(cliente));
            when(clienteRepository.save(any(Cliente.class))).thenReturn(cliente);

            clienteService.deleteById("c1");

            assertFalse(cliente.isActivo());
            verify(clienteRepository).save(cliente);
        }
    }

    @Nested
    @DisplayName("search()")
    class Search {
        @Test
        @DisplayName("Debe buscar clientes por query")
        void debeBuscarPorQuery() {
            when(clienteRepository.search("calderito")).thenReturn(List.of(cliente));

            List<Cliente> result = clienteService.search("calderito");

            assertEquals(1, result.size());
            verify(clienteRepository).search("calderito");
        }
    }
}
