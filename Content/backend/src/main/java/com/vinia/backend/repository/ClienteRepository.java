package com.vinia.backend.repository;

import com.vinia.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, String> {
    List<Cliente> findByActivoTrue();

    @Query("SELECT c FROM Cliente c WHERE c.activo = true AND (" +
            "LOWER(c.nombre) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.cif) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Cliente> search(@Param("query") String query);

    List<Cliente> findByTipoAndActivoTrue(String tipo);
}
