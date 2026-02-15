package com.vinia.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 150)
    private String apellidos;

    @Column(nullable = false, unique = true)
    private String username; // Added for auth

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password; // Added for auth

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false, length = 20)
    private String rol; // Admin, Comercial, Visor, Almacen

    @Column(columnDefinition = "TEXT")
    private String avatar;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
