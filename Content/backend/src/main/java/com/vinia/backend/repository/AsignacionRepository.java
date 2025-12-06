package com.vinia.backend.repository;

import com.vinia.backend.model.Asignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionRepository extends JpaRepository<Asignacion, String> {
    List<Asignacion> findByComercialIdAndActivoTrue(String comercialId);

    Optional<Asignacion> findByClienteIdAndActivoTrue(String clienteId);

    Optional<Asignacion> findByClienteIdAndComercialId(String clienteId, String comercialId);

    List<Asignacion> findByActivoTrue();
}
