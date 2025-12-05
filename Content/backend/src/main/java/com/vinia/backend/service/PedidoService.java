package com.vinia.backend.service;

import com.vinia.backend.model.Pedido;
import com.vinia.backend.model.LineaPedido;
import com.vinia.backend.model.Vino;
import com.vinia.backend.repository.PedidoRepository;
import com.vinia.backend.repository.VinoRepository;
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
        // Generate number
        String lastNum = pedidoRepository.findLastNumeroPedido();
        int nextSeq = 1;
        if (lastNum != null && lastNum.startsWith("PED-")) {
            try {
                nextSeq = Integer.parseInt(lastNum.substring(4)) + 1;
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        pedido.setNumero(String.format("PED-%06d", nextSeq));

        // Calculate totals and update stock
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal subtotal = BigDecimal.ZERO;

        if (pedido.getLineas() != null) {
            for (LineaPedido linea : pedido.getLineas()) {
                Vino vino = vinoRepository.findById(linea.getVino().getId())
                        .orElseThrow(() -> new RuntimeException("Vino no encontrado: " + linea.getVino().getId()));

                if (vino.getStock() < linea.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para vino: " + vino.getNombre());
                }

                vino.setStock(vino.getStock() - linea.getCantidad());
                vinoRepository.save(vino);

                linea.setPedido(pedido);
                subtotal = subtotal.add(linea.getSubtotal());
            }
        }

        pedido.setSubtotal(subtotal);
        // Assuming IVA is already handled or simple calculation
        pedido.setTotal(subtotal.multiply(new BigDecimal("1.21"))); // Simple 21% IVA

        return pedidoRepository.save(pedido);
    }

    public Pedido updateStatus(String id, String estado) {
        Pedido pedido = findById(id);
        pedido.setEstado(estado);
        return pedidoRepository.save(pedido);
    }
}
