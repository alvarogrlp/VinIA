package com.vinia.backend.model;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for domain model entities.
 * 
 * Validates default values, lifecycle hooks,
 * and critical business properties.
 */
class ModelTest {

    @Test
    @DisplayName("Vino: debe tener valores por defecto correctos")
    void vinoDefaultValues() {
        Vino vino = new Vino();

        assertEquals(0, vino.getStock());
        assertEquals(10, vino.getStockMinimo());
        assertEquals(6, vino.getBotellasPorCaja());
        assertEquals("BOTELLA", vino.getFormatoVenta());
    }

    @Test
    @DisplayName("Cliente: debe tener valores por defecto correctos")
    void clienteDefaultValues() {
        Cliente cliente = new Cliente();

        assertTrue(cliente.isActivo());
        assertEquals(BigDecimal.ZERO, cliente.getDescuento());
        assertEquals(BigDecimal.ZERO, cliente.getRiesgoActual());
        assertEquals(new BigDecimal("1000.00"), cliente.getLimiteCredito());
    }

    @Test
    @DisplayName("Pedido: debe tener estado por defecto PENDIENTE_VALIDACION")
    void pedidoDefaultEstado() {
        Pedido pedido = new Pedido();

        assertEquals(EstadoPedido.PENDIENTE_VALIDACION, pedido.getEstado());
        assertFalse(pedido.getBloqueado());
        assertEquals(BigDecimal.ZERO, pedido.getSubtotal());
        assertEquals(BigDecimal.ZERO, pedido.getTotal());
        assertEquals(new BigDecimal("21.00"), pedido.getIva());
    }

    @Test
    @DisplayName("LineaPedido: debe tener valores por defecto correctos")
    void lineaPedidoDefaultValues() {
        LineaPedido linea = new LineaPedido();

        assertEquals(BigDecimal.ZERO, linea.getDescuento());
        assertEquals("BOTELLA", linea.getTipoBulto());
    }

    @Test
    @DisplayName("Usuario: debe estar activo por defecto")
    void usuarioDefaultValues() {
        Usuario usuario = new Usuario();

        assertTrue(usuario.isActivo());
    }

    @Test
    @DisplayName("Asignacion: debe estar activa por defecto")
    void asignacionDefaultValues() {
        Asignacion asignacion = new Asignacion();

        assertTrue(asignacion.isActivo());
    }

    @Test
    @DisplayName("EstadoPedido: debe contener todos los estados del ciclo de vida")
    void estadoPedidoValues() {
        EstadoPedido[] expected = {
                EstadoPedido.BORRADOR,
                EstadoPedido.PENDIENTE_VALIDACION,
                EstadoPedido.EN_PREPARACION,
                EstadoPedido.LISTO_PARA_REPARTO,
                EstadoPedido.ENVIADO,
                EstadoPedido.EN_REPARTO,
                EstadoPedido.ENTREGADO,
                EstadoPedido.FACTURADO,
                EstadoPedido.CANCELADO
        };

        assertArrayEquals(expected, EstadoPedido.values());
    }

    @Test
    @DisplayName("Vino: PrePersist debe establecer timestamps")
    void vinoPrePersistTimestamps() {
        Vino vino = new Vino();
        vino.onCreate();

        assertNotNull(vino.getCreatedAt());
        assertNotNull(vino.getUpdatedAt());
    }

    @Test
    @DisplayName("Vino: PreUpdate debe actualizar updatedAt")
    void vinoPreUpdateTimestamp() {
        Vino vino = new Vino();
        vino.onCreate();
        var createdAt = vino.getCreatedAt();

        vino.onUpdate();

        assertEquals(createdAt, vino.getCreatedAt());
        assertNotNull(vino.getUpdatedAt());
    }
}
