package com.vinia.backend.service;

import com.vinia.backend.model.Vino;
import com.vinia.backend.repository.VinoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Service for managing the Wine Catalog (Vinos).
 * 
 * Provides CRUD operations for wines and tracks modifications using the
 * AuditService.
 */
@Service
public class VinoService {

    @Autowired
    private VinoRepository vinoRepository;

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

    public List<Vino> findAll() {
        return vinoRepository.findAll();
    }

    public Vino findById(String id) {
        return vinoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vino no encontrado"));
    }

    /**
     * Saves a new wine or updates an existing one.
     * Logs the 'SAVE' action to the audit log.
     * 
     * @param vino The wine to save.
     * @return The saved wine.
     */
    public Vino save(Vino vino) {
        Vino saved = vinoRepository.save(vino);
        auditService.log(getCurrentUsername(), "SAVE", "Vino", saved.getId(), "Nombre: " + saved.getNombre());
        return saved;
    }

    /**
     * Deletes a wine by its ID.
     * Logs the 'DELETE' action to the audit log.
     * 
     * @param id The ID of the wine to delete.
     */
    public void deleteById(String id) {
        vinoRepository.deleteById(id);
        auditService.log(getCurrentUsername(), "DELETE", "Vino", id, null);
    }

    private String normalize(String text) {
        if (text == null)
            return "";
        return java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase();
    }

    public List<Vino> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return findAll();
        }

        String normalizedQuery = normalize(query);
        String[] terms = normalizedQuery.split("\\s+");

        // Professional search: Multi-term "AND" strategy
        // Filtering in memory to support accent-insensitivity across all fields
        // reliably
        return findAll().stream()
                .filter(v -> {
                    String fullText = normalize(
                            (v.getNombre() != null ? v.getNombre() : "") + " " +
                                    (v.getBodega() != null ? v.getBodega() : "") + " " +
                                    (v.getDenominacionOrigen() != null ? v.getDenominacionOrigen() : "") + " " +
                                    (v.getVariedadUva() != null ? v.getVariedadUva() : "") + " " +
                                    (v.getTipo() != null ? v.getTipo() : "") + " " +
                                    (v.getAroma() != null ? v.getAroma() : "") + " " +
                                    (v.getSabor() != null ? v.getSabor() : "") + " " +
                                    v.getAno());

                    // Check if ALL terms are present in the wine's data
                    for (String term : terms) {
                        if (!fullText.contains(term)) {
                            return false;
                        }
                    }
                    return true;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Vino> findLowStock(Integer threshold) {
        return vinoRepository.findByStockLessThan(threshold);
    }

    public Vino updateStock(String id, Integer stock) {
        Vino vino = findById(id);
        int oldStock = vino.getStock();
        vino.setStock(stock);
        if (vino.getStock() == null)
            vino.setStock(0);
        Vino saved = vinoRepository.save(vino);
        auditService.log(getCurrentUsername(), "UPDATE_STOCK", "Vino", id, "Old: " + oldStock + ", New: " + stock);
        return saved;
    }
}
