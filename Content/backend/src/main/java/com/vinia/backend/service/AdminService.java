package com.vinia.backend.service;

import com.vinia.backend.model.Asignacion;
import com.vinia.backend.model.Cliente;
import com.vinia.backend.model.Usuario;
import com.vinia.backend.repository.AsignacionRepository;
import com.vinia.backend.repository.ClienteRepository;
import com.vinia.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private AsignacionRepository asignacionRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public Asignacion asignarCliente(String clienteId, String comercialId, String adminId) {
        // Verify admin (simplified)
        Usuario admin = usuarioRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin no encontrado"));
        if (!"Administración".equals(admin.getRol())) {
            throw new RuntimeException("No autorizado");
        }

        // Deactivate existing assignment
        asignacionRepository.findByClienteIdAndActivoTrue(clienteId)
                .ifPresent(a -> {
                    a.setActivo(false);
                    asignacionRepository.save(a);
                });

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        Usuario comercial = usuarioRepository.findById(comercialId)
                .orElseThrow(() -> new RuntimeException("Comercial no encontrado"));

        Asignacion nueva = new Asignacion();
        nueva.setCliente(cliente);
        nueva.setComercial(comercial);
        return asignacionRepository.save(nueva);
    }

    public List<Cliente> getClientesComercial(String comercialId) {
        return asignacionRepository.findByComercialIdAndActivoTrue(comercialId).stream()
                .map(Asignacion::getCliente)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getEstadisticasComercial(String comercialId) {
        // Simplified stats
        Map<String, Object> stats = new HashMap<>();
        Usuario comercial = usuarioRepository.findById(comercialId).orElse(null);

        if (comercial != null) {
            stats.put("comercial_id", comercial.getId());
            stats.put("comercial_nombre", comercial.getNombre() + " " + comercial.getApellidos());

            List<Asignacion> asignaciones = asignacionRepository.findByComercialIdAndActivoTrue(comercialId);
            stats.put("num_clientes", asignaciones.size());

            // Real stats would require querying orders linked to these clients
            stats.put("total_ventas", 0);
            stats.put("num_pedidos", 0);
            stats.put("ticket_medio", 0);
        }

        return stats;
    }

    public void desasignarCliente(String clienteId, String comercialId) {
        asignacionRepository.findByClienteIdAndActivoTrue(clienteId)
                .ifPresent(a -> {
                    if (a.getComercial().getId().equals(comercialId)) {
                        a.setActivo(false);
                        asignacionRepository.save(a);
                    }
                });
    }
}
