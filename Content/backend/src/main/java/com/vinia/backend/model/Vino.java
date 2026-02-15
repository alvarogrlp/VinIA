package com.vinia.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "vinos", indexes = {
        @Index(name = "idx_vino_nombre", columnList = "nombre"),
        @Index(name = "idx_vino_bodega", columnList = "bodega"),
        @Index(name = "idx_vino_tipo", columnList = "tipo"),
        @Index(name = "idx_vino_denominacion", columnList = "denominacion_origen")
})
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Vino {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "codigo_interno", length = 50)
    @com.fasterxml.jackson.annotation.JsonProperty("codigo_interno")
    private String codigoInterno;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(nullable = false, length = 200)
    private String bodega;

    @Column(nullable = false, length = 50)
    private String tipo; // Tinto, Blanco, etc.

    @Column(nullable = false)
    private Integer ano;

    @Column(nullable = false, precision = 10, scale = 2)
    @com.fasterxml.jackson.annotation.JsonProperty("precio_unitario")
    private BigDecimal precio;

    @Column(name = "denominacion_origen", nullable = false, length = 100)
    @com.fasterxml.jackson.annotation.JsonProperty("denominacion_origen")
    private String denominacionOrigen;

    @Column(name = "grado_alcohol", nullable = false, precision = 4, scale = 2)
    @com.fasterxml.jackson.annotation.JsonProperty("grado_alcohol")
    private BigDecimal gradoAlcohol;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "stock_minimo")
    @com.fasterxml.jackson.annotation.JsonProperty("stock_minimo")
    private Integer stockMinimo = 10;

    @Column(name = "imagen_url", columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("imagen_url")
    private String imagenUrl;

    @Column(name = "botellas_por_caja")
    @com.fasterxml.jackson.annotation.JsonProperty("botellas_por_caja")
    private Integer botellasPorCaja = 6;

    @Column(name = "formato_venta", length = 20)
    @com.fasterxml.jackson.annotation.JsonProperty("formato_venta")
    private String formatoVenta = "BOTELLA";

    @ElementCollection
    @CollectionTable(name = "vino_maridajes", joinColumns = @JoinColumn(name = "vino_id"))
    @Column(name = "maridaje")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<String> maridaje;

    @Column(name = "nota_cata", columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("nota_cata")
    private String notaCata;

    @Column(name = "variedad_uva")
    @com.fasterxml.jackson.annotation.JsonProperty("variedad_uva")
    private String variedadUva;

    @Column(name = "temperatura_servicio")
    @com.fasterxml.jackson.annotation.JsonProperty("temperatura_servicio")
    private String temperaturaServicio;

    @Column(name = "potencial_guarda")
    @com.fasterxml.jackson.annotation.JsonProperty("potencial_guarda")
    private String potencialGuarda;

    @Column(columnDefinition = "TEXT")
    private String aroma; // Notas olfativas / salida

    @Column(columnDefinition = "TEXT")
    private String sabor; // Notas gustativas

    @Column(columnDefinition = "TEXT")
    private String premios;

    @Column(name = "created_at")
    @com.fasterxml.jackson.annotation.JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @com.fasterxml.jackson.annotation.JsonProperty("updated_at")
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
