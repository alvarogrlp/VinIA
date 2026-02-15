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

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AdminService.
 * 
 * Covers client-commercial assignment, deassignment,
 * commercial statistics, and authorization checks.
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private AsignacionRepository asignacionRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AdminService adminService;

    private Usuario admin;
    private Usuario comercial;
    private Cliente cliente;

    @BeforeEach
    void setUp() {
        admin = new Usuario();
        admin.setId("u-admin");
        admin.setNombre("Admin");
        admin.setApellidos("Sistema");
        admin.setUsername("admin");
        admin.setRol("Administración");
        admin.setActivo(true);

        comercial = new Usuario();
        comercial.setId("u-carlos");
        comercial.setNombre("Carlos");
        comercial.setApellidos("González");
        comercial.setUsername("carlos");
        comercial.setRol("Comercial");
        comercial.setActivo(true);

        cliente = new Cliente();
        cliente.setId("c1");
        cliente.setNombre("Restaurante El Calderito");
        cliente.setCif("B12345678");
        cliente.setActivo(true);
    }

    @Nested
    @DisplayName("asignarCliente()")
    class AsignarCliente {
        @Test
        @DisplayName("Debe crear nueva asignación correctamente")
        void debeCrearNuevaAsignacion() {
            when(usuarioRepository.findById("u-admin")).thenReturn(Optional.of(admin));
            when(asignacionRepository.findByClienteIdAndActivoTrue("c1")).thenReturn(Optional.empty());
            when(asignacionRepository.findByClienteIdAndComercialId("c1", "u-carlos")).thenReturn(Optional.empty());
            when(clienteRepository.findById("c1")).thenReturn(Optional.of(cliente));
            when(usuarioRepository.findById("u-carlos")).thenReturn(Optional.of(comercial));
            when(asignacionRepository.save(any(Asignacion.class))).thenAnswer(i -> {
                Asignacion a = i.getArgument(0);
                a.setId("a-new");
                return a;
            });

            Asignacion result = adminService.asignarCliente("c1", "u-carlos", "u-admin");

            assertNotNull(result);
            verify(asignacionRepository).save(any(Asignacion.class));
        }

        @Test
        @DisplayName("Debe rechazar si no es administrador")
        void debeRechazarSiNoEsAdmin() {
            Usuario noAdmin = new Usuario();
            noAdmin.setId("u-nonadmin");
            noAdmin.setRol("Comercial");

            when(usuarioRepository.findById("u-nonadmin")).thenReturn(Optional.of(noAdmin));

            assertThrows(RuntimeException.class,
                    () -> adminService.asignarCliente("c1", "u-carlos", "u-nonadmin"));
        }

        @Test
        @DisplayName("Debe rechazar si cliente ya está asignado a otro comercial")
        void debeRechazarSiYaAsignado() {
            Asignacion existente = new Asignacion();
            existente.setCliente(cliente);
            Usuario otroComercial = new Usuario();
            otroComercial.setId("u-otro");
            otroComercial.setNombre("Otro");
            otroComercial.setApellidos("Comercial");
            existente.setComercial(otroComercial);

            when(usuarioRepository.findById("u-admin")).thenReturn(Optional.of(admin));
            when(asignacionRepository.findByClienteIdAndActivoTrue("c1")).thenReturn(Optional.of(existente));

            assertThrows(RuntimeException.class,
                    () -> adminService.asignarCliente("c1", "u-carlos", "u-admin"));
        }

        @Test
        @DisplayName("Debe reactivar asignación existente inactiva")
        void debeReactivarAsignacionInactiva() {
            Asignacion inactiva = new Asignacion();
            inactiva.setId("a-old");
            inactiva.setCliente(cliente);
            inactiva.setComercial(comercial);
            inactiva.setActivo(false);

            when(usuarioRepository.findById("u-admin")).thenReturn(Optional.of(admin));
            when(asignacionRepository.findByClienteIdAndActivoTrue("c1")).thenReturn(Optional.empty());
            when(asignacionRepository.findByClienteIdAndComercialId("c1", "u-carlos"))
                    .thenReturn(Optional.of(inactiva));
            when(asignacionRepository.save(any(Asignacion.class))).thenAnswer(i -> i.getArgument(0));

            Asignacion result = adminService.asignarCliente("c1", "u-carlos", "u-admin");

            assertTrue(result.isActivo());
            verify(asignacionRepository).save(inactiva);
        }
    }

    @Nested
    @DisplayName("getClientesComercial()")
    class GetClientesComercial {
        @Test
        @DisplayName("Debe devolver clientes asignados al comercial")
        void debeRetornarClientesAsignados() {
            Asignacion asignacion = new Asignacion();
            asignacion.setCliente(cliente);
            asignacion.setComercial(comercial);
            asignacion.setActivo(true);

            when(asignacionRepository.findByComercialIdAndActivoTrue("u-carlos")).thenReturn(List.of(asignacion));

            List<Cliente> result = adminService.getClientesComercial("u-carlos");

            assertEquals(1, result.size());
            assertEquals("Restaurante El Calderito", result.get(0).getNombre());
        }
    }

    @Nested
    @DisplayName("desasignarCliente()")
    class DesasignarCliente {
        @Test
        @DisplayName("Debe desactivar asignación existente")
        void debeDesactivarAsignacion() {
            Asignacion asignacion = new Asignacion();
            asignacion.setCliente(cliente);
            asignacion.setComercial(comercial);
            asignacion.setActivo(true);

            when(asignacionRepository.findByClienteIdAndActivoTrue("c1")).thenReturn(Optional.of(asignacion));

            adminService.desasignarCliente("c1", "u-carlos");

            assertFalse(asignacion.isActivo());
            verify(asignacionRepository).save(asignacion);
        }

        @Test
        @DisplayName("No debe hacer nada si no hay asignación")
        void noDebeHacerNadaSinAsignacion() {
            when(asignacionRepository.findByClienteIdAndActivoTrue("c1")).thenReturn(Optional.empty());

            adminService.desasignarCliente("c1", "u-carlos");

            verify(asignacionRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("getEstadisticasComercial()")
    class GetEstadisticasComercial {
        @Test
        @DisplayName("Debe devolver estadísticas del comercial")
        void debeRetornarEstadisticas() {
            Asignacion asignacion = new Asignacion();
            asignacion.setCliente(cliente);
            asignacion.setComercial(comercial);

            when(usuarioRepository.findById("u-carlos")).thenReturn(Optional.of(comercial));
            when(asignacionRepository.findByComercialIdAndActivoTrue("u-carlos")).thenReturn(List.of(asignacion));

            Map<String, Object> stats = adminService.getEstadisticasComercial("u-carlos");

            assertEquals("u-carlos", stats.get("comercial_id"));
            assertEquals(1, stats.get("num_clientes"));
            assertTrue(stats.get("comercial_nombre").toString().contains("Carlos"));
        }

        @Test
        @DisplayName("Debe devolver mapa vacío si comercial no existe")
        void debeRetornarMapaVacioSiNoExiste() {
            when(usuarioRepository.findById("inexistente")).thenReturn(Optional.empty());

            Map<String, Object> stats = adminService.getEstadisticasComercial("inexistente");

            assertTrue(stats.isEmpty());
        }
    }
}
