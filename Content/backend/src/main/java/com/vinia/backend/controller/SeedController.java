package com.vinia.backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/test")
public class SeedController {

        private final JdbcTemplate jdbcTemplate;

        public SeedController(JdbcTemplate jdbcTemplate) {
                this.jdbcTemplate = jdbcTemplate;
        }

        @PostMapping("/seed")
        public ResponseEntity<String> seedData() {
                try {
                        Integer clienteCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM clientes",
                                        Integer.class);
                        Integer vinoCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vinos", Integer.class);

                        if (clienteCount != null && clienteCount > 0 && vinoCount != null && vinoCount > 0) {
                                return ResponseEntity.ok("Database already has " + clienteCount + " clients and "
                                                + vinoCount + " wines. Skipping seed.");
                        }

                        if (clienteCount == null || clienteCount == 0) {
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo) VALUES ('c1000000-0000-0000-0000-000000000001', 'Restaurante El Calderito', 'B38456789', 'Restaurante', 'Ctra. Provincial 130', 'Santa Ursula', '38390', 'Santa Cruz de Tenerife', '922301122', 'info@elcalderito.com', 'Encargado', 10.00, 'Cliente preferente', true)");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo) VALUES ('c1000000-0000-0000-0000-000000000002', 'Tasca El Granero', 'B38123456', 'Restaurante', 'C/ El Durazno 45', 'La Orotava', '38300', 'Santa Cruz de Tenerife', '922334455', 'reservas@tascaelgranero.com', 'Encargado', 5.00, 'Buen consumo', true)");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo) VALUES ('c1000000-0000-0000-0000-000000000003', 'Bodegon El Drago', 'B38789012', 'Restaurante', 'C/ Marques de Celada 2', 'Tegueste', '38280', 'Santa Cruz de Tenerife', '922543001', 'contacto@bodegoneldrago.com', 'Encargado', 15.00, 'Historico', true)");
                        }

                        if (vinoCount == null || vinoCount == 0) {
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v1000000-0000-0000-0000-000000000001', 'VIN-CAN-001', 'Vinatigo Baboso Negro', 'Bodegas Vinatigo', 'Tinto', 2020, 22.90, 'D.O. Valle de La Orotava', 13.50, 'Vino tinto de variedad autoctona', 45, 12, 'https://vinatigo.com/wp-content/uploads/2021/04/Baboso-Negro.jpg', 'Aromas a frutos rojos maduros')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v1000000-0000-0000-0000-000000000002', 'VIN-CAN-002', 'Vina Norte Listan Blanco', 'Bodegas Vina Norte', 'Blanco', 2022, 14.50, 'D.O. Tacoronte-Acentejo', 11.80, 'Vino blanco joven y fresco', 80, 15, 'https://bodegasinsulares.es/wp-content/uploads/2020/05/vina-norte-blanco-seco.jpg', 'Notas citricas y florales')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v1000000-0000-0000-0000-000000000003', 'VIN-CAN-003', 'Suertes del Marques Trenzado', 'Suertes del Marques', 'Tinto', 2021, 38.00, 'D.O. Valle de La Orotava', 14.00, 'Vino tinto de parcela vieja', 30, 8, 'https://suertesdelmarques.com/wp-content/uploads/2020/06/Trenzado.jpg', 'Complejo y elegante')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v1000000-0000-0000-0000-000000000004', 'VIN-CAN-004', 'Tajinaste Tradicional Tinto', 'Bodegas Tajinaste', 'Tinto', 2021, 9.50, 'D.O. Valle de La Orotava', 13.50, 'Vino tinto joven y fresco', 120, 20, 'https://bodegastajinaste.com/wp-content/uploads/2020/02/Tajinaste-Tradicional.jpg', 'Aromas a frutos rojos frescos')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v1000000-0000-0000-0000-000000000005', 'VIN-CAN-005', 'Tajinaste Blanco Afrutado', 'Bodegas Tajinaste', 'Blanco', 2022, 8.90, 'D.O. Valle de La Orotava', 12.50, 'Vino blanco joven y afrutado', 150, 25, 'https://bodegastajinaste.com/wp-content/uploads/2020/02/Tajinaste-Afrutado.jpg', 'Notas tropicales y citricas')");

                                jdbcTemplate.execute(
                                                "INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000001', 'Carnes rojas')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000001', 'Quesos semicurados')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000002', 'Pescados')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000002', 'Mariscos')");
                        }

                        Integer finalClienteCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM clientes",
                                        Integer.class);
                        Integer finalVinoCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vinos",
                                        Integer.class);

                        return ResponseEntity.ok("Seed completed! Database now has " + finalClienteCount
                                        + " clients and " + finalVinoCount + " wines.");
                } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.status(500).body("Error seeding data: " + e.getMessage());
                }
        }

        @PostMapping("/seed-more-wines")
        public ResponseEntity<String> seedMoreWines() {
                try {
                        // Vinos premium de diferentes regiones
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000001', 'VIN-RIB-001', 'Vega Sicilia Unico', 'Bodegas Vega Sicilia', 'Tinto', 2015, 385.00, 'D.O. Ribera del Duero', 14.50, 'Uno de los vinos mas prestigiosos de Espana', 15, 3, 'https://example.com/vega-sicilia.jpg', 'Complejo, elegante, con gran potencial de guarda')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000002', 'VIN-RIO-001', 'Marques de Riscal Reserva', 'Herederos del Marques de Riscal', 'Tinto', 2018, 18.50, 'D.O.Ca. Rioja', 14.00, 'Clasico de Rioja con crianza en barrica', 60, 15, 'https://example.com/riscal.jpg', 'Frutas rojas, vainilla, especias')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000003', 'VIN-RIO-002', 'La Rioja Alta Gran Reserva 904', 'La Rioja Alta', 'Tinto', 2015, 45.00, 'D.O.Ca. Rioja', 13.50, 'Gran Reserva emblematico de Rioja', 25, 5, 'https://example.com/904.jpg', 'Elegante, complejo, con notas de cuero y tabaco')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000004', 'VIN-PRI-001', 'Aalto', 'Bodegas Aalto', 'Tinto', 2019, 32.00, 'D.O. Ribera del Duero', 15.00, 'Vino moderno de Ribera del Duero', 40, 10, 'https://example.com/aalto.jpg', 'Potente, frutal, con taninos maduros')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000005', 'VIN-RUE-001', 'Vatan', 'Bodegas y Vinedos Vatan', 'Tinto', 2018, 28.00, 'D.O. Toro', 15.00, 'Tinta de Toro con gran concentracion', 35, 8, 'https://example.com/vatan.jpg', 'Potente, concentrado, frutas negras')");

                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000006', 'VIN-RIA-001', 'Albarino de Fefiñanes', 'Palacio de Fefiñanes', 'Blanco', 2022, 16.50, 'D.O. Rias Baixas', 12.50, 'Albarino clasico de Rias Baixas', 70, 15, 'https://example.com/fefi.jpg', 'Fresco, mineral, notas citricas')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000007', 'VIN-PRO-001', 'Emilio Moro', 'Bodegas Emilio Moro', 'Tinto', 2020, 22.00, 'D.O. Ribera del Duero', 14.50, 'Tempranillo de gran calidad', 50, 12, 'https://example.com/emilio-moro.jpg', 'Frutas maduras, especiado, elegante')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000008', 'VIN-PEN-001', 'Abadia Retuerta Seleccion Especial', 'Abadia Retuerta', 'Tinto', 2019, 26.00, 'V.T. Castilla y Leon', 14.00, 'Blend de variedades internacionales', 30, 8, 'https://example.com/abadia.jpg', 'Complejo, equilibrado, largo')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000009', 'VIN-NAV-001', 'Chivite Coleccion 125 Reserva', 'Bodegas Chivite', 'Tinto', 2017, 35.00, 'D.O. Navarra', 14.00, 'Reserva premium de Navarra', 25, 6, 'https://example.com/chivite.jpg', 'Elegante, frutas rojas, especias')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000010', 'VIN-SOM-001', 'Dominio de Pingus', 'Dominio de Pingus', 'Tinto', 2018, 650.00, 'D.O. Ribera del Duero', 15.00, 'Vino de culto, produccion limitada', 8, 2, 'https://example.com/pingus.jpg', 'Excepcional, concentrado, complejo')");

                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000011', 'VIN-PRI-002', 'Pesquera Crianza', 'Bodegas Alejandro Fernandez', 'Tinto', 2019, 19.50, 'D.O. Ribera del Duero', 14.00, 'Referente de Ribera del Duero', 55, 12, 'https://example.com/pesquera.jpg', 'Frutas negras, especiado, potente')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000012', 'VIN-RUE-002', 'Alion', 'Bodegas Alion', 'Tinto', 2018, 58.00, 'D.O. Ribera del Duero', 14.50, 'Vino moderno y concentrado', 20, 5, 'https://example.com/alion.jpg', 'Potente, frutas maduras, taninos sedosos')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000013', 'VIN-CAT-001', 'Clos Mogador', 'Clos Mogador', 'Tinto', 2019, 75.00, 'D.O.Q. Priorat', 14.50, 'Gran vino del Priorat', 18, 4, 'https://example.com/mogador.jpg', 'Mineral, complejo, frutas negras')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000014', 'VIN-CAT-002', 'Gramona Imperial Gran Reserva', 'Gramona', 'Espumoso', 2015, 42.00, 'D.O. Cava', 12.00, 'Cava de larga crianza', 30, 8, 'https://example.com/gramona.jpg', 'Elegante, burbujas finas, complejo')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000015', 'VIN-RIO-003', 'Muga Reserva', 'Bodegas Muga', 'Tinto', 2018, 24.00, 'D.O.Ca. Rioja', 14.00, 'Clasico de Rioja', 45, 10, 'https://example.com/muga.jpg', 'Equilibrado, frutas rojas, especias')");

                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000016', 'VIN-RIA-002', 'Martin Codax', 'Bodegas Martin Codax', 'Blanco', 2022, 11.50, 'D.O. Rias Baixas', 12.50, 'Albarino joven y fresco', 90, 20, 'https://example.com/codax.jpg', 'Fresco, frutal, mineral')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000017', 'VIN-RUE-003', 'Numanthia', 'Bodegas Numanthia', 'Tinto', 2019, 38.00, 'D.O. Toro', 15.00, 'Tinta de Toro potente', 28, 6, 'https://example.com/numanthia.jpg', 'Concentrado, frutas negras, especiado')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000018', 'VIN-RIO-004', 'Marques de Caceres Crianza', 'Marques de Caceres', 'Tinto', 2019, 12.50, 'D.O.Ca. Rioja', 13.50, 'Rioja accesible y de calidad', 75, 18, 'https://example.com/caceres.jpg', 'Frutas rojas, especias, equilibrado')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000019', 'VIN-VAL-001', 'Godello Valdesil', 'Bodegas Valdesil', 'Blanco', 2021, 18.00, 'D.O. Valdeorras', 13.00, 'Godello de gran calidad', 40, 10, 'https://example.com/valdesil.jpg', 'Mineral, frutas blancas, elegante')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000020', 'VIN-JER-001', 'Tio Pepe Fino', 'Gonzalez Byass', 'Fortificado', 2020, 9.50, 'D.O. Jerez', 15.00, 'Fino clasico de Jerez', 100, 25, 'https://example.com/tiopepe.jpg', 'Seco, punzante, almendrado')");

                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000021', 'VIN-PEN-002', 'Mauro', 'Bodegas Mauro', 'Tinto', 2019, 28.00, 'V.T. Castilla y Leon', 14.50, 'Vino de autor reconocido', 32, 8, 'https://example.com/mauro.jpg', 'Complejo, frutas maduras, especiado')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000022', 'VIN-CAT-003', 'Mas La Plana', 'Miguel Torres', 'Tinto', 2017, 48.00, 'D.O. Penedes', 13.50, 'Cabernet Sauvignon emblematico', 22, 5, 'https://example.com/masplana.jpg', 'Elegante, complejo, gran estructura')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000023', 'VIN-RIO-005', 'Vina Ardanza Reserva', 'La Rioja Alta', 'Tinto', 2015, 28.00, 'D.O.Ca. Rioja', 13.50, 'Reserva clasico de Rioja', 38, 9, 'https://example.com/ardanza.jpg', 'Elegante, frutas rojas, especias')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000024', 'VIN-RUE-004', 'Pintia', 'Bodegas Pintia', 'Tinto', 2018, 32.00, 'D.O. Toro', 15.00, 'Tinta de Toro moderna', 26, 6, 'https://example.com/pintia.jpg', 'Potente, frutas negras, taninos maduros')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000025', 'VIN-RIA-003', 'Pazo de Senorans', 'Pazo de Senorans', 'Blanco', 2021, 22.00, 'D.O. Rias Baixas', 13.00, 'Albarino de alta gama', 35, 8, 'https://example.com/pazo.jpg', 'Complejo, mineral, frutas blancas')");

                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000026', 'VIN-RIO-006', 'Contino Reserva', 'Vinos de Contino', 'Tinto', 2017, 26.00, 'D.O.Ca. Rioja', 14.00, 'Vino de finca unica', 30, 7, 'https://example.com/contino.jpg', 'Elegante, equilibrado, complejo')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000027', 'VIN-CAT-004', 'Clos Erasmus', 'Clos i Terrasses', 'Tinto', 2018, 95.00, 'D.O.Q. Priorat', 15.00, 'Gran vino del Priorat', 12, 3, 'https://example.com/erasmus.jpg', 'Concentrado, mineral, complejo')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000028', 'VIN-RUE-005', 'Termanthia', 'Bodegas Numanthia', 'Tinto', 2017, 185.00, 'D.O. Toro', 15.50, 'Vino de culto de Toro', 10, 2, 'https://example.com/termanthia.jpg', 'Excepcional, concentrado, potente')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000029', 'VIN-RIO-007', 'Vina Tondonia Reserva', 'Lopez de Heredia', 'Tinto', 2010, 38.00, 'D.O.Ca. Rioja', 13.00, 'Rioja tradicional de larga crianza', 20, 5, 'https://example.com/tondonia.jpg', 'Clasico, elegante, complejo')");
                        jdbcTemplate.execute(
                                        "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata) VALUES ('v2000000-0000-0000-0000-000000000030', 'VIN-JER-002', 'Matusalem Oloroso Dulce', 'Gonzalez Byass', 'Fortificado', 2015, 28.00, 'D.O. Jerez', 20.00, 'Oloroso dulce de gran complejidad', 25, 6, 'https://example.com/matusalem.jpg', 'Dulce, complejo, notas de frutos secos')");

                        Integer vinoCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM vinos", Integer.class);
                        return ResponseEntity.ok("Added 30 more wines! Total wines in database: " + vinoCount);
                } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.status(500).body("Error adding wines: " + e.getMessage());
                }
        }
}
