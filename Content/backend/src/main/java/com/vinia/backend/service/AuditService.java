package com.vinia.backend.service;

import com.vinia.backend.model.AuditLog;
import com.vinia.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(String username, String action, String entity, String entityId, String details) {
        try {
            AuditLog log = new AuditLog();
            log.setUsername(username != null ? username : "SYSTEM");
            log.setAction(action);
            log.setEntity(entity);
            log.setEntityId(entityId);
            log.setDetails(details);
            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }
}
