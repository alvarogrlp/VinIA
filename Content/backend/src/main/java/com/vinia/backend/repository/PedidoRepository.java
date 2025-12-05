package com.vinia.backend.repository;

import com.vinia.backend.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, String> {
    List<Pedido> findByClienteIdOrderByFechaDesc(String clienteId);

    List<Pedido> findByEstadoOrderByFechaDesc(String estado);

    @Query("SELECT p.numero FROM Pedido p ORDER BY p.createdAt DESC LIMIT 1")
    String findLastNumeroPedido();
}
