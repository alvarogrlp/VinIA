package com.vinia.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "asignaciones_cliente_comercial", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "cliente_id", "comercial_id" })
})
public class Asignacion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "comercial_id", nullable = false)
    private Usuario comercial;

    @Column(name = "fecha_asignacion")
    private LocalDateTime fechaAsignacion;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (fechaAsignacion == null) {
            fechaAsignacion = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
