package com.vinia.backend.service;

import com.vinia.backend.model.AuditLog;
import com.vinia.backend.repository.AuditLogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuditService.
 * 
 * Covers audit log creation, null-safe username handling,
 * and graceful error handling.
 */
@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditService auditService;

    @Test
    @DisplayName("Debe crear log de auditoría con todos los campos")
    void debeCrearLogConTodosLosCampos() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        auditService.log("admin", "CREATE", "Pedido", "PED-000001", "Total: 100.00");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals("admin", saved.getUsername());
        assertEquals("CREATE", saved.getAction());
        assertEquals("Pedido", saved.getEntity());
        assertEquals("PED-000001", saved.getEntityId());
        assertEquals("Total: 100.00", saved.getDetails());
    }

    @Test
    @DisplayName("Debe usar SYSTEM cuando username es null")
    void debeUsarSystemCuandoUsernameNull() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        auditService.log(null, "DELETE", "Vino", "v1", null);

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(captor.capture());

        assertEquals("SYSTEM", captor.getValue().getUsername());
    }

    @Test
    @DisplayName("No debe lanzar excepción si falla el guardado")
    void noDebeLanzarExcepcionSiFalla() {
        when(auditLogRepository.save(any(AuditLog.class))).thenThrow(new RuntimeException("DB Error"));

        // Should NOT throw
        assertDoesNotThrow(() ->
                auditService.log("admin", "CREATE", "Pedido", "PED-001", "Test"));
    }
}
