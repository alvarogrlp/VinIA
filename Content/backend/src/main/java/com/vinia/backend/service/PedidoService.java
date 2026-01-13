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

                // Deduct stock immediately to reserve it
                vino.setStock(vino.getStock() - linea.getCantidad());
                vinoRepository.save(vino);
            }
        }

        // 5. DEBT CHECK
        BigDecimal riesgoActual = cliente.getRiesgoActual() != null ? cliente.getRiesgoActual() : BigDecimal.ZERO;
        BigDecimal limiteCredito = cliente.getLimiteCredito() != null ? cliente.getLimiteCredito()
                : new BigDecimal("1000.00");

        BigDecimal deudaTotal = riesgoActual.add(pedido.getTotal());
        if (deudaTotal.compareTo(limiteCredito) > 0) {
            pedido.setEstado(EstadoPedido.PENDIENTE_VALIDACION);
            pedido.setBloqueado(true);
            pedido.setMotivoBloqueo(
                    "Límite de crédito excedido. Riesgo: " + deudaTotal + " > Limite: " + limiteCredito);
            System.out.println("PEDIDO BLOQUEADO: " + pedido.getMotivoBloqueo());
        } else {
            // Auto-approve if no debts
            pedido.setEstado(EstadoPedido.EN_PREPARACION);
            pedido.setBloqueado(false);

            // Update client risk immediately
            cliente.setRiesgoActual(deudaTotal);
            clienteRepository.save(cliente);
        }

        Pedido saved = pedidoRepository.save(pedido);
        auditService.log(getCurrentUsername(), "CREATE", "Pedido", saved.getNumero(),
                "Total: " + saved.getTotal() + ", Cliente: " + cliente.getNombre());
        return saved;
    }

    @Transactional
    public Pedido updateStatus(String id, String nuevoEstadoStr) {
        Pedido pedido = findById(id);
        EstadoPedido nuevoEstado;
        try {
            nuevoEstado = EstadoPedido.valueOf(nuevoEstadoStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: " + nuevoEstadoStr);
        }

        EstadoPedido oldState = pedido.getEstado();

        // LOGIC TRANSITIONS

        // 1. Validation (Validation -> Preparacion)
        if (oldState == EstadoPedido.PENDIENTE_VALIDACION && nuevoEstado == EstadoPedido.EN_PREPARACION) {
            pedido.setBloqueado(false);
            pedido.setMotivoBloqueo(null);

            // Update risk now if we didn't before (because it was blocked)
            com.vinia.backend.model.Cliente cliente = pedido.getCliente();
            cliente.setRiesgoActual(cliente.getRiesgoActual().add(pedido.getTotal()));
            clienteRepository.save(cliente);
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
            if (!Boolean.TRUE.equals(pedido.getBloqueado()) && oldState != EstadoPedido.PENDIENTE_VALIDACION) {
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
}
