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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PedidoService.
 * 
 * Covers order creation, status transitions, stock management,
 * credit risk validation, cancellation, and deletion logic.
 */
@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private VinoRepository vinoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private PedidoService pedidoService;

    private Cliente cliente;
    private Vino vino;
    private Pedido pedido;
    private LineaPedido linea;

    @BeforeEach
    void setUp() {
        // Setup cliente
        cliente = new Cliente();
        cliente.setId("c1");
        cliente.setNombre("Restaurante El Calderito");
        cliente.setCif("B12345678");
        cliente.setTipo("Restaurante");
        cliente.setLimiteCredito(new BigDecimal("5000.00"));
        cliente.setRiesgoActual(BigDecimal.ZERO);

        // Setup vino
        vino = new Vino();
        vino.setId("v1");
        vino.setNombre("Rioja Reserva");
        vino.setStock(100);
        vino.setPrecio(new BigDecimal("25.50"));

        // Setup linea pedido
        linea = new LineaPedido();
        linea.setVino(vino);
        linea.setCantidad(10);
        linea.setPrecioUnitario(new BigDecimal("25.50"));
        linea.setSubtotal(new BigDecimal("255.00"));

        // Setup pedido
        pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setSubtotal(new BigDecimal("255.00"));
        pedido.setTotal(new BigDecimal("308.55")); // con IVA
        pedido.setIva(new BigDecimal("21.00"));
        pedido.setLineas(new ArrayList<>(List.of(linea)));
    }

    @Nested
    @DisplayName("findAll()")
    class FindAll {
        @Test
        @DisplayName("Debe devolver todos los pedidos")
        void debeRetornarTodos() {
            when(pedidoRepository.findAll()).thenReturn(List.of(pedido));

            List<Pedido> result = pedidoService.findAll();

            assertEquals(1, result.size());
            verify(pedidoRepository).findAll();
        }
    }

    @Nested
    @DisplayName("findById()")
    class FindById {
        @Test
        @DisplayName("Debe encontrar pedido por ID")
        void debeEncontrarPorId() {
            pedido.setId("p1");
            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));

            Pedido result = pedidoService.findById("p1");

            assertNotNull(result);
        }

        @Test
        @DisplayName("Debe lanzar excepción si pedido no existe")
        void debeLanzarExcepcionSiNoExiste() {
            when(pedidoRepository.findById("inexistente")).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> pedidoService.findById("inexistente"));
        }
    }

    @Nested
    @DisplayName("findByCliente()")
    class FindByCliente {
        @Test
        @DisplayName("Debe encontrar pedidos por cliente ID")
        void debeEncontrarPorCliente() {
            when(pedidoRepository.findByClienteIdOrderByFechaDesc("c1")).thenReturn(List.of(pedido));

            List<Pedido> result = pedidoService.findByCliente("c1");

            assertEquals(1, result.size());
        }
    }

    @Nested
    @DisplayName("createPedido()")
    class CreatePedido {
        @Test
        @DisplayName("Debe crear pedido correctamente y descontar stock")
        void debeCrearPedidoYDescontarStock() {
            when(clienteRepository.findById("c1")).thenReturn(Optional.of(cliente));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));
            when(pedidoRepository.findLastNumeroPedido()).thenReturn(null);
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> {
                Pedido p = i.getArgument(0);
                p.setId("p-new");
                return p;
            });

            Pedido created = pedidoService.createPedido(pedido);

            assertNotNull(created);
            assertEquals("PED-000001", created.getNumero());
            assertEquals(90, vino.getStock()); // 100 - 10
            verify(vinoRepository).save(vino);
            verify(auditService).log(anyString(), eq("CREATE"), eq("Pedido"), anyString(), anyString());
        }

        @Test
        @DisplayName("Debe generar número secuencial correcto")
        void debeGenerarNumeroSecuencial() {
            when(clienteRepository.findById("c1")).thenReturn(Optional.of(cliente));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));
            when(pedidoRepository.findLastNumeroPedido()).thenReturn("PED-000042");
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

            Pedido created = pedidoService.createPedido(pedido);

            assertEquals("PED-000043", created.getNumero());
        }

        @Test
        @DisplayName("Debe bloquear pedido si excede límite de crédito")
        void debeBloquearSiExcedeLimite() {
            cliente.setLimiteCredito(new BigDecimal("100.00")); // Límite bajo
            pedido.setTotal(new BigDecimal("500.00")); // Total excede

            when(clienteRepository.findById("c1")).thenReturn(Optional.of(cliente));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));
            when(pedidoRepository.findLastNumeroPedido()).thenReturn(null);
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

            Pedido created = pedidoService.createPedido(pedido);

            assertEquals(EstadoPedido.PENDIENTE_VALIDACION, created.getEstado());
            assertTrue(created.getBloqueado());
            assertNotNull(created.getMotivoBloqueo());
        }

        @Test
        @DisplayName("Debe lanzar excepción si no hay stock suficiente")
        void debeLanzarExcepcionSiStockInsuficiente() {
            vino.setStock(5); // Solo 5 disponibles, se piden 10

            when(clienteRepository.findById("c1")).thenReturn(Optional.of(cliente));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));
            when(pedidoRepository.findLastNumeroPedido()).thenReturn(null);

            RuntimeException ex = assertThrows(RuntimeException.class,
                    () -> pedidoService.createPedido(pedido));
            assertTrue(ex.getMessage().contains("Stock insuficiente"));
        }

        @Test
        @DisplayName("Debe lanzar excepción si no hay cliente asignado")
        void debeLanzarExcepcionSinCliente() {
            pedido.setCliente(null);

            assertThrows(RuntimeException.class, () -> pedidoService.createPedido(pedido));
        }

        @Test
        @DisplayName("Debe permitir borrador sin chequeo de riesgo")
        void debePermitirBorradorSinRiesgo() {
            pedido.setEstado(EstadoPedido.BORRADOR);

            when(clienteRepository.findById("c1")).thenReturn(Optional.of(cliente));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));
            when(pedidoRepository.findLastNumeroPedido()).thenReturn(null);
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

            Pedido created = pedidoService.createPedido(pedido);

            assertFalse(created.getBloqueado());
        }
    }

    @Nested
    @DisplayName("updateStatus()")
    class UpdateStatus {
        @BeforeEach
        void setUpPedido() {
            pedido.setId("p1");
            pedido.setNumero("PED-000001");
            pedido.setEstado(EstadoPedido.EN_PREPARACION);
            pedido.setCliente(cliente);
            pedido.setBloqueado(false);
        }

        @Test
        @DisplayName("Debe cancelar pedido y restaurar stock")
        void debeCancelarYRestaurarStock() {
            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

            Pedido updated = pedidoService.updateStatus("p1", "CANCELADO");

            assertEquals(EstadoPedido.CANCELADO, updated.getEstado());
            assertEquals(110, vino.getStock()); // 100 + 10 restaurado
            verify(vinoRepository).save(vino);
        }

        @Test
        @DisplayName("Debe validar transición de PENDIENTE_VALIDACION a EN_PREPARACION")
        void debeValidarTransicion() {
            pedido.setEstado(EstadoPedido.PENDIENTE_VALIDACION);
            pedido.setBloqueado(true);
            cliente.setRiesgoActual(BigDecimal.ZERO);

            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

            Pedido updated = pedidoService.updateStatus("p1", "EN_PREPARACION");

            assertEquals(EstadoPedido.EN_PREPARACION, updated.getEstado());
            assertFalse(updated.getBloqueado());
            verify(clienteRepository).save(cliente);
        }

        @Test
        @DisplayName("Debe lanzar excepción con estado inválido")
        void debeLanzarExcepcionEstadoInvalido() {
            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));

            assertThrows(RuntimeException.class,
                    () -> pedidoService.updateStatus("p1", "ESTADO_INVENTADO"));
        }

        @Test
        @DisplayName("Confirmar borrador debe bloquear si excede crédito")
        void confirmarBorradorDebeBloquearSiExcede() {
            pedido.setEstado(EstadoPedido.BORRADOR);
            cliente.setLimiteCredito(new BigDecimal("100.00"));
            pedido.setTotal(new BigDecimal("500.00"));

            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

            Pedido updated = pedidoService.updateStatus("p1", "EN_PREPARACION");

            assertEquals(EstadoPedido.PENDIENTE_VALIDACION, updated.getEstado());
            assertTrue(updated.getBloqueado());
        }

        @Test
        @DisplayName("Cancelar pedido bloqueado no debe reducir riesgo")
        void cancelarPedidoBloqueadoNoDebeReducirRiesgo() {
            pedido.setEstado(EstadoPedido.PENDIENTE_VALIDACION);
            pedido.setBloqueado(true);
            BigDecimal riesgoInicial = cliente.getRiesgoActual();

            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));
            when(pedidoRepository.save(any(Pedido.class))).thenAnswer(i -> i.getArgument(0));

            pedidoService.updateStatus("p1", "CANCELADO");

            // Risk should NOT be reduced for blocked orders
            assertEquals(riesgoInicial, cliente.getRiesgoActual());
        }
    }

    @Nested
    @DisplayName("deletePedido()")
    class DeletePedido {
        @BeforeEach
        void setUpPedido() {
            pedido.setId("p1");
            pedido.setNumero("PED-000001");
            pedido.setEstado(EstadoPedido.EN_PREPARACION);
            pedido.setCliente(cliente);
            pedido.setBloqueado(false);
        }

        @Test
        @DisplayName("Debe eliminar pedido y restaurar stock")
        void debeEliminarYRestaurarStock() {
            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));

            pedidoService.deletePedido("p1");

            assertEquals(110, vino.getStock()); // 100 + 10
            verify(pedidoRepository).delete(pedido);
            verify(auditService).log(anyString(), eq("DELETE"), eq("Pedido"), anyString(), anyString());
        }

        @Test
        @DisplayName("No debe restaurar stock de pedido ya cancelado")
        void noDebeRestaurarStockDePedidoCancelado() {
            pedido.setEstado(EstadoPedido.CANCELADO);

            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));

            pedidoService.deletePedido("p1");

            assertEquals(100, vino.getStock()); // Sin cambios
            verify(vinoRepository, never()).save(any());
        }

        @Test
        @DisplayName("Debe restaurar riesgo del cliente al eliminar pedido activo")
        void debeRestaurarRiesgoAlEliminar() {
            cliente.setRiesgoActual(new BigDecimal("308.55"));

            when(pedidoRepository.findById("p1")).thenReturn(Optional.of(pedido));
            when(vinoRepository.findById("v1")).thenReturn(Optional.of(vino));

            pedidoService.deletePedido("p1");

            assertEquals(0, cliente.getRiesgoActual().compareTo(BigDecimal.ZERO));
            verify(clienteRepository).save(cliente);
        }
    }
}
