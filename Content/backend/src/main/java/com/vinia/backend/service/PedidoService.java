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

    @Autowired
    private com.vinia.backend.repository.ClienteRepository clienteRepository;

    @Transactional
    public Pedido createPedido(Pedido pedido) {
        // Fetch existing client ref to avoid transient error
        if (pedido.getCliente() != null && pedido.getCliente().getId() != null) {
            com.vinia.backend.model.Cliente clienteRef = clienteRepository.findById(pedido.getCliente().getId())
                    .orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + pedido.getCliente().getId()));
            pedido.setCliente(clienteRef);
        }

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

        if (pedido.getLineas() != null) {
            for (LineaPedido linea : pedido.getLineas()) {
                Vino vino = vinoRepository.findById(linea.getVino().getId())
                        .orElseThrow(() -> new RuntimeException("Vino no encontrado: " + linea.getVino().getId()));

                if (vino.getStock() < linea.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para vino: " + vino.getNombre());
                }

                // Update stock
                vino.setStock(vino.getStock() - linea.getCantidad());
                vinoRepository.save(vino);

                linea.setPedido(pedido);
                // Trust frontend for subtotal/total to handle discounts correctly
            }
        }

        // If totals are null (should not be from frontend), initialize them
        if (pedido.getSubtotal() == null)
            pedido.setSubtotal(BigDecimal.ZERO);
        if (pedido.getTotal() == null)
            pedido.setTotal(BigDecimal.ZERO);

        return pedidoRepository.save(pedido);
    }

    public Pedido updateStatus(String id, String estado) {
        Pedido pedido = findById(id);
        pedido.setEstado(estado);
        return pedidoRepository.save(pedido);
    }
}
