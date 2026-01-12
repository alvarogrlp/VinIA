package com.vinia.backend.repository;

import com.vinia.backend.model.Vino;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VinoRepository extends JpaRepository<Vino, String> {
    List<Vino> findByStockLessThan(Integer stock);

    @Query("SELECT v FROM Vino v WHERE " +
            "LOWER(v.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.bodega) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.denominacionOrigen) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.variedadUva) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.aroma) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.sabor) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.tipo) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Vino> search(@Param("query") String query);
}
