package com.vinia.backend.service;

import com.vinia.backend.model.Cliente;
import com.vinia.backend.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> findAll() {
        return clienteRepository.findByActivoTrue();
    }

    public Cliente findById(String id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    public Cliente save(Cliente cliente) {
        return clienteRepository.save(cliente);
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
