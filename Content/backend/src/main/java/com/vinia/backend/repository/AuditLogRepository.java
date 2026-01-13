package com.vinia.backend.repository;

import com.vinia.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findByUsername(String username);

    List<AuditLog> findAllByOrderByTimestampDesc();
}
