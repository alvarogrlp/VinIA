package com.vinia.backend.service;

import com.vinia.backend.model.Pedido;
import com.vinia.backend.model.EstadoPedido;
import com.vinia.backend.model.LineaPedido;
import com.vinia.backend.model.Vino;
import com.vinia.backend.repository.PedidoRepository;
import com.vinia.backend.repository.VinoRepository;
import com.vinia.backend.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.math.BigDecimal;

/**
 * Service for processing Orders (Pedidos).
 * 
 * Manages the lifecycle of an order, from creation to finalization.
 * Enforces business rules such as stock validation and status transitions.
 * Integrates with AuditService for tracking critical actions.
 */
@Service
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private VinoRepository vinoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private AuditService auditService;

    private String getCurrentUsername() {
        try {
            return org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()
                    .getName();
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    public List<Pedido> findAll() {
        return pedidoRepository.findAll();
    }

    public List<Pedido> findByCliente(String clienteId) {
        return pedidoRepository.findByClienteIdOrderByFechaDesc(clienteId);
    }

    public Pedido findById(String id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    private void checkRiesgoYConfirmar(Pedido pedido, com.vinia.backend.model.Cliente cliente) {
        BigDecimal riesgoActual = cliente.getRiesgoActual() != null ? cliente.getRiesgoActual() : BigDecimal.ZERO;
        BigDecimal limiteCredito = cliente.getLimiteCredito() != null ? cliente.getLimiteCredito()
                : new BigDecimal("1000.00");

        BigDecimal deudaTotal = riesgoActual.add(pedido.getTotal());
        if (deudaTotal.compareTo(limiteCredito) > 0) {
            pedido.setEstado(EstadoPedido.PENDIENTE_VALIDACION);
            pedido.setBloqueado(true);
            pedido.setMotivoBloqueo(
                    "Límite de crédito excedido. Riesgo: " + deudaTotal + " > Limite: " + limiteCredito);
        } else {
            pedido.setEstado(EstadoPedido.EN_PREPARACION);
            pedido.setBloqueado(false);
            cliente.setRiesgoActual(deudaTotal);
            clienteRepository.save(cliente);
        }
    }

    /**
     * Creates a new order.
     * 
     * - Generates a sequential order number (PED-XXXXXX).
     * - Validates and deducts stock for all line items.
     * - Checks client credit limit (Risk) if the order is not a Draft.
     * - Persists the order and updates client risk data.
     * 
     * @param pedido The order object containing lines and client info.
     * @return The created, persisted Order.
     * @throws RuntimeException If stock is insufficient or data is invalid.
     */
    @Transactional
    public Pedido createPedido(Pedido pedido) {
        // 1. Fetch Client
        if (pedido.getCliente() == null || pedido.getCliente().getId() == null) {
            throw new RuntimeException("El pedido debe tener un cliente asignado");
        }
        com.vinia.backend.model.Cliente cliente = clienteRepository.findById(pedido.getCliente().getId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        pedido.setCliente(cliente);

        // 2. Generate Number
        String lastNum = pedidoRepository.findLastNumeroPedido();
        int nextSeq = 1;
        if (lastNum != null && lastNum.startsWith("PED-")) {
            try {
                nextSeq = Integer.parseInt(lastNum.substring(4)) + 1;
            } catch (NumberFormatException e) {
            }
        }
        pedido.setNumero(String.format("PED-%06d", nextSeq));

        // 3. Initialize Totals
        if (pedido.getSubtotal() == null)
            pedido.setSubtotal(BigDecimal.ZERO);
        if (pedido.getTotal() == null)
            pedido.setTotal(BigDecimal.ZERO);

        // 4. Link Lines AND DEDUCT STOCK
        if (pedido.getLineas() != null) {
            for (LineaPedido linea : pedido.getLineas()) {
                linea.setPedido(pedido);

                Vino vino = vinoRepository.findById(linea.getVino().getId())
                        .orElseThrow(() -> new RuntimeException("Vino " + linea.getVino().getId() + " no encontrado"));

                if (vino.getStock() < linea.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para: " + vino.getNombre() +
                            ". Solicitado: " + linea.getCantidad() + ", Disponible: " + vino.getStock());
                }

                vino.setStock(vino.getStock() - linea.getCantidad());
                vinoRepository.save(vino);
            }
        }

        // 5. DEBT CHECK (Skip if Draft)
        if (pedido.getEstado() != EstadoPedido.BORRADOR) {
            checkRiesgoYConfirmar(pedido, cliente);
        } else {
            pedido.setBloqueado(false);
        }

        Pedido saved = pedidoRepository.save(pedido);
        auditService.log(getCurrentUsername(), "CREATE", "Pedido", saved.getNumero(),
                "Total: " + saved.getTotal() + ", Cliente: " + cliente.getNombre());
        return saved;
    }

    /**
     * Updates an existing order's details.
     * 
     * Allows modifying line items, quantities, and general info.
     * Re-calculates totals and validates business rules.
     * 
     * @param id      The ID of the order to update.
     * @param details The new order data.
     * @return The updated order.
     */
    @Transactional
    public Pedido updatePedido(String id, Pedido details) {
        Pedido pedido = findById(id);
        EstadoPedido oldEstado = pedido.getEstado();

        // Restore stock of old lines first
        if (pedido.getLineas() != null) {
            for (LineaPedido oldLinea : pedido.getLineas()) {
                Vino v = oldLinea.getVino();
                v.setStock(v.getStock() + oldLinea.getCantidad());
                vinoRepository.save(v);
            }
            pedido.getLineas().clear();
        }

        // Update fields
        pedido.setNotas(details.getNotas());
        pedido.setFormaPago(details.getFormaPago());
        pedido.setDireccionEnvioSnapshot(details.getDireccionEnvioSnapshot());
        pedido.setInstruccionesEntrega(details.getInstruccionesEntrega());
        pedido.setSubtotal(details.getSubtotal());
        pedido.setDescuento(details.getDescuento());
        pedido.setIva(details.getIva());
        pedido.setTotal(details.getTotal());

        // Add new lines and deduct stock
        if (details.getLineas() != null) {
            for (LineaPedido newLinea : details.getLineas()) {
                newLinea.setPedido(pedido);
                Vino v = vinoRepository.findById(newLinea.getVino().getId())
                        .orElseThrow(() -> new RuntimeException("Vino no encontrado"));
                if (v.getStock() < newLinea.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para: " + v.getNombre());
                }
                v.setStock(v.getStock() - newLinea.getCantidad());
                vinoRepository.save(v);
                pedido.getLineas().add(newLinea);
            }
        }

        // If moving from BORRADOR to active status, perform risk check
        if (oldEstado == EstadoPedido.BORRADOR && details.getEstado() != EstadoPedido.BORRADOR) {
            checkRiesgoYConfirmar(pedido, pedido.getCliente());
        } else {
            pedido.setEstado(details.getEstado());
        }

        Pedido saved = pedidoRepository.save(pedido);
        auditService.log(getCurrentUsername(), "UPDATE", "Pedido", saved.getNumero(), "Pedido actualizado");
        return saved;
    }

    /**
     * Updates an order's status and triggers associated side effects.
     * 
     * - Validates state transitions.
     * - Updates client credit risk when moving from Draft to Active.
     * - Restores stock if the order is cancelled.
     * - Blocks orders if credit limits are exceeded during confirmation.
     * 
     * @param id             The order ID.
     * @param nuevoEstadoStr The new status as a string.
     * @return The updated order.
     */
    @Transactional
    public Pedido updateStatus(String id, String nuevoEstadoStr) {
        Pedido pedido = findById(id);
        EstadoPedido nuevoEstado;
        try {
            nuevoEstado = EstadoPedido.valueOf(nuevoEstadoStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + nuevoEstadoStr);
        }

        EstadoPedido oldState = pedido.getEstado();

        // LOGIC TRANSITIONS

        // 1. Validation (Validation -> Preparacion)
        if (oldState == EstadoPedido.PENDIENTE_VALIDACION && nuevoEstado == EstadoPedido.EN_PREPARACION) {
            pedido.setBloqueado(false);
            pedido.setMotivoBloqueo(null);

            // Update risk now
            com.vinia.backend.model.Cliente cliente = pedido.getCliente();
            cliente.setRiesgoActual(cliente.getRiesgoActual().add(pedido.getTotal()));
            clienteRepository.save(cliente);
        }

        // 1b. Confirmation (Borrador -> Cualquier estado activo)
        if (oldState == EstadoPedido.BORRADOR && nuevoEstado != EstadoPedido.BORRADOR
                && nuevoEstado != EstadoPedido.CANCELADO) {
            com.vinia.backend.model.Cliente cliente = pedido.getCliente();
            BigDecimal riesgoActual = cliente.getRiesgoActual() != null ? cliente.getRiesgoActual() : BigDecimal.ZERO;
            BigDecimal limiteCredito = cliente.getLimiteCredito() != null ? cliente.getLimiteCredito()
                    : new BigDecimal("1000.00");

            BigDecimal deudaTotal = riesgoActual.add(pedido.getTotal());

            if (deudaTotal.compareTo(limiteCredito) > 0) {
                // Force Validation if credit exceeded
                nuevoEstado = EstadoPedido.PENDIENTE_VALIDACION;
                pedido.setBloqueado(true);
                pedido.setMotivoBloqueo("Límite de crédito excedido al confirmar borrador.");
            } else {
                // Add to risk
                cliente.setRiesgoActual(deudaTotal);
                clienteRepository.save(cliente);
            }
        }

        // 2. Cancellation (Restore Stock)
        if (nuevoEstado == EstadoPedido.CANCELADO && oldState != EstadoPedido.CANCELADO) {
            for (LineaPedido linea : pedido.getLineas()) {
                Vino vino = vinoRepository.findById(linea.getVino().getId())
                        .orElseThrow(() -> new RuntimeException("Vino " + linea.getVino().getId() + " no encontrado"));

                // Restore stock
                vino.setStock(vino.getStock() + linea.getCantidad());
                vinoRepository.save(vino);
            }

            // If it was counted in risk, remove it?
            // If it was PENDIENTE_VALIDACION, it wasn't added to risk yet (line 98 logic).
            // If it was EN_PREPARACION, it WAS added.
            if (!Boolean.TRUE.equals(pedido.getBloqueado()) && oldState != EstadoPedido.PENDIENTE_VALIDACION
                    && oldState != EstadoPedido.BORRADOR) {
                com.vinia.backend.model.Cliente cliente = pedido.getCliente();
                if (cliente.getRiesgoActual().compareTo(pedido.getTotal()) >= 0) {
                    cliente.setRiesgoActual(cliente.getRiesgoActual().subtract(pedido.getTotal()));
                    clienteRepository.save(cliente);
                }
            }
        }

        // 3. Delivery (Reparto -> Entregado) handled elsewhere or just state change
        // here.

        pedido.setEstado(nuevoEstado);
        Pedido saved = pedidoRepository.save(pedido);
        auditService.log(getCurrentUsername(), "UPDATE_STATUS", "Pedido", pedido.getNumero(),
                "Old: " + oldState + ", New: " + nuevoEstado);
        return saved;
    }

    @Transactional
    /**
     * Deletes an order permanently or cancels it.
     * 
     * If the order was not already cancelled, stock is restored.
     * 
     * @param id The ID of the order to delete.
     */
    public void deletePedido(String id) {
        Pedido pedido = findById(id);

        // Restore Stock for all lines before deleting
        if (pedido.getLineas() != null && pedido.getEstado() != EstadoPedido.CANCELADO) {
            for (LineaPedido linea : pedido.getLineas()) {
                Vino vino = vinoRepository.findById(linea.getVino().getId())
                        .orElseThrow(() -> new RuntimeException("Vino " + linea.getVino().getId() + " no encontrado"));

                vino.setStock(vino.getStock() + linea.getCantidad());
                vinoRepository.save(vino);
            }
        }

        // Restore client risk if order was active (not Draft/Blocked/Canceled)
        if (pedido.getEstado() != EstadoPedido.BORRADOR &&
                pedido.getEstado() != EstadoPedido.PENDIENTE_VALIDACION &&
                pedido.getEstado() != EstadoPedido.CANCELADO &&
                !Boolean.TRUE.equals(pedido.getBloqueado())) {

            com.vinia.backend.model.Cliente cliente = pedido.getCliente();
            if (cliente.getRiesgoActual() != null && cliente.getRiesgoActual().compareTo(pedido.getTotal()) >= 0) {
                cliente.setRiesgoActual(cliente.getRiesgoActual().subtract(pedido.getTotal()));
                clienteRepository.save(cliente);
            }
        }

        pedidoRepository.delete(pedido);
        auditService.log(getCurrentUsername(), "DELETE", "Pedido", pedido.getNumero(),
                "Pedido eliminado permanentemente");
    }
}
