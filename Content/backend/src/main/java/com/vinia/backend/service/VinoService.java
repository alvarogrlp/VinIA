package com.vinia.backend.service;

import com.vinia.backend.model.Vino;
import com.vinia.backend.repository.VinoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VinoService {

    @Autowired
    private VinoRepository vinoRepository;

    public List<Vino> findAll() {
        return vinoRepository.findAll();
    }

    public Vino findById(String id) {
        return vinoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vino no encontrado"));
    }

    public Vino save(Vino vino) {
        return vinoRepository.save(vino);
    }

    public void deleteById(String id) {
        vinoRepository.deleteById(id);
    }

    public List<Vino> search(String query) {
        return vinoRepository.search(query);
    }

    public List<Vino> findLowStock(Integer threshold) {
        return vinoRepository.findByStockLessThan(threshold);
    }
}
