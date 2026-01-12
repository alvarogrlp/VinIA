package com.vinia.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "pedidos")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String numero;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "fecha")
    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EstadoPedido estado = EstadoPedido.PENDIENTE_VALIDACION;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean bloqueado = false;

    @Column(name = "motivo_bloqueo")
    private String motivoBloqueo;

    @Column(name = "firma_entrega", columnDefinition = "TEXT")
    private String firmaEntrega;

    @Column(name = "url_factura")
    private String urlFactura;

    @Column(name = "forma_pago")
    private String formaPago;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    private BigDecimal iva = new BigDecimal("21.00");

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    @Column(name = "direccion_entrega", columnDefinition = "TEXT")
    private String direccionEntrega;

    @Column(name = "direccion_envio_snapshot", columnDefinition = "TEXT")
    private String direccionEnvioSnapshot;

    @Column(name = "instrucciones_entrega", columnDefinition = "TEXT")
    private String instruccionesEntrega;

    @Column(name = "albaran_descargado")
    private Boolean albaranDescargado = false;

    @Column(name = "fecha_descarga_albaran")
    private LocalDateTime fechaDescargaAlbaran;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("pedido")
    private List<LineaPedido> lineas;

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
