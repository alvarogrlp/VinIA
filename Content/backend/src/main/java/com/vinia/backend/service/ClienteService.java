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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AsignacionRepository asignacionRepository;

    public List<Cliente> findAll() {
        return clienteRepository.findByActivoTrue();
    }

    public Cliente findById(String id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @Transactional
    public Cliente save(Cliente cliente) {
        boolean isNew = cliente.getId() == null;
        Cliente savedCliente = clienteRepository.save(cliente);

        if (isNew && cliente.getZona() != null) {
            assignCommercialByZone(savedCliente);
        }

        return savedCliente;
    }

    private void assignCommercialByZone(Cliente cliente) {
        String zona = cliente.getZona();
        Usuario targetUser = null;

        if ("Santa Cruz".equalsIgnoreCase(zona)) {
            targetUser = usuarioRepository.findByUsername("laura").orElse(null);
        } else if ("Norte".equalsIgnoreCase(zona)) {
            targetUser = usuarioRepository.findByUsername("carlos").orElse(null);
        } else if ("Sur".equalsIgnoreCase(zona)) {
            targetUser = usuarioRepository.findByUsername("comercial").orElse(null);
            if (targetUser == null) {
                targetUser = usuarioRepository.findByUsername("carlos").orElse(null); // Fallback
            }
        }

        if (targetUser != null) {
            Asignacion asignacion = new Asignacion();
            asignacion.setCliente(cliente);
            asignacion.setComercial(targetUser);
            asignacion.setActivo(true);
            asignacion.setFechaAsignacion(LocalDateTime.now());
            asignacionRepository.save(asignacion);
            System.out.println(
                    "Auto-assigned client " + cliente.getNombre() + " (" + zona + ") to " + targetUser.getNombre());
        }
    }

    public void deleteById(String id) {
        Cliente cliente = findById(id);
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    public List<Cliente> search(String query) {
        return clienteRepository.search(query);
    }
}
