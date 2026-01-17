package com.vinia.backend.config;

import com.vinia.backend.model.Usuario;
import com.vinia.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

        @Bean
        CommandLineRunner initData(UsuarioRepository usuarioRepository,
                        com.vinia.backend.repository.VinoRepository vinoRepository,
                        org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
                return args -> {
                        // Check if admin exists
                        if (usuarioRepository.findByUsername("admin").isEmpty()) {
                                Usuario admin = new Usuario();
                                admin.setUsername("admin");
                                admin.setPassword("admin");
                                admin.setNombre("Administrador");
                                admin.setApellidos("Sistema");
                                admin.setRol("Administración");
                                admin.setActivo(true);
                                usuarioRepository.save(admin);
                                System.out.println("Admin user created: admin/admin");
                        }

                        // Check if comercial exists
                        if (usuarioRepository.findByUsername("comercial").isEmpty()) {
                                Usuario comercial = new Usuario();
                                comercial.setUsername("comercial");
                                comercial.setPassword("comercial");
                                comercial.setNombre("Juan");
                                comercial.setApellidos("Comercial");
                                comercial.setRol("Comercial");
                                comercial.setActivo(true);
                                usuarioRepository.save(comercial);
                                System.out.println("Comercial user created: comercial/comercial");
                        }
                        // Check if almacen exists
                        if (usuarioRepository.findByUsername("almacen").isEmpty()) {
                                Usuario almacen = new Usuario();
                                almacen.setUsername("almacen");
                                almacen.setPassword("almacen");
                                almacen.setNombre("Pedro");
                                almacen.setApellidos("Almacen");
                                almacen.setRol("Almacén");
                                almacen.setActivo(true);
                                usuarioRepository.save(almacen);
                                System.out.println("Almacen user created: almacen/almacen");
                        }

                        // Check if repartidor exists
                        if (usuarioRepository.findByUsername("repartidor").isEmpty()) {
                                Usuario repartidor = new Usuario();
                                repartidor.setUsername("repartidor");
                                repartidor.setPassword("repartidor");
                                repartidor.setNombre("Luis");
                                repartidor.setApellidos("Repartidor");
                                repartidor.setRol("Repartidor");
                                repartidor.setActivo(true);
                                usuarioRepository.save(repartidor);
                                System.out.println("Repartidor user created: repartidor/repartidor");
                        }

                        // Maintain compatibility with previous users
                        if (usuarioRepository.findByUsername("carlos").isEmpty()) {
                                Usuario carlos = new Usuario();
                                carlos.setUsername("carlos");
                                carlos.setPassword("1234");
                                carlos.setNombre("Carlos");
                                carlos.setApellidos("Comercial");
                                carlos.setRol("Comercial");
                                carlos.setActivo(true);
                                usuarioRepository.save(carlos);
                        }

                        if (usuarioRepository.findByUsername("laura").isEmpty()) {
                                Usuario laura = new Usuario();
                                laura.setUsername("laura");
                                laura.setPassword("1234");
                                laura.setNombre("Laura");
                                laura.setApellidos("Ventas");
                                laura.setRol("Comercial");
                                laura.setActivo(true);
                                usuarioRepository.save(laura);
                        }

                        // Seed initial data if empty
                        if (vinoRepository.count() == 0) {
                                System.out.println("Seeding database with updated wine catalog...");

                                // Insert 15 clients (Standard Demo Data)
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, limite_credito, riesgo_actual, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000001', 'Restaurante El Calderito', 'B38456789', 'Restaurante', 'Ctra. Provincial 130', 'Santa Ursula', '38390', 'Santa Cruz de Tenerife', '922301122', 'info@elcalderito.com', 'Juan Perez', 10.00, 'Cliente preferente', true, 'Ctra. Provincial 130, Santa Ursula', 'Ctra. Provincial 130, Santa Ursula', 5000.00, 0.00, 28.423, -16.491, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, limite_credito, riesgo_actual, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000002', 'Tasca El Granero', 'B38123456', 'Restaurante', 'C/ El Durazno 45', 'La Orotava', '38300', 'Santa Cruz de Tenerife', '922334455', 'reservas@tascaelgranero.com', 'Maria Lopez', 5.00, 'Buen consumo', true, 'C/ El Durazno 45, La Orotava', 'C/ El Durazno 45, La Orotava', 1000.00, 950.00, 28.391, -16.524, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, limite_credito, riesgo_actual, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000003', 'Bodegon El Drago', 'B38789012', 'Restaurante', 'C/ Marques de Celada 2', 'Tegueste', '38280', 'Santa Cruz de Tenerife', '922543001', 'contacto@bodegoneldrago.com', 'Pedro Garcia', 15.00, 'Cliente historico', true, 'C/ Marques de Celada 2, Tegueste', 'C/ Marques de Celada 2, Tegueste', 2000.00, 0.00, 28.520, -16.320, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, limite_credito, riesgo_actual, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000004', 'Hotel Botanico', 'B38234567', 'Hotel', 'Avda. Richard J. Yeoward 1', 'Puerto de la Cruz', '38400', 'Santa Cruz de Tenerife', '922381400', 'compras@hotelbotanico.com', 'Ana Martinez', 12.00, 'Hotel 5 estrellas', true, 'Avda. Richard J. Yeoward 1', 'Avda. Richard J. Yeoward 1', 10000.00, 0.00, 28.411, -16.539, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000005', 'Vinoteca La Barrica', 'B38345678', 'Tienda', 'C/ Castillo 15', 'La Laguna', '38201', 'Santa Cruz de Tenerife', '922259876', 'info@labarrica.com', 'Carlos Ruiz', 8.00, 'Tienda especializada', true, 'C/ Castillo 15, La Laguna', 'C/ Castillo 15, La Laguna', 28.485, -16.315, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000006', 'Restaurante El Rincón', 'B38456790', 'Restaurante', 'Plaza del Adelantado 3', 'La Laguna', '38201', 'Santa Cruz de Tenerife', '922631274', 'reservas@elrincon.com', 'Luis Fernandez', 10.00, 'Cocina tradicional', true, 'Plaza del Adelantado 3', 'Plaza del Adelantado 3', 28.488, -16.316, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000007', 'Parador de Las Cañadas', 'B38567891', 'Hotel', 'Carretera TF-21 Km 76', 'La Orotava', '38300', 'Santa Cruz de Tenerife', '922386415', 'reservas@parador.es', 'Isabel Gomez', 15.00, 'Parador Nacional', true, 'Carretera TF-21 Km 76', 'Carretera TF-21 Km 76', 28.223, -16.630, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000008', 'Tasca Los Abuelos', 'B38678902', 'Restaurante', 'C/ San Agustin 12', 'La Orotava', '38300', 'Santa Cruz de Tenerife', '922330987', 'info@losabuelos.com', 'Miguel Torres', 7.00, 'Cocina casera', true, 'C/ San Agustin 12', 'C/ San Agustin 12', 28.392, -16.525, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000009', 'Supermercados La Isla', 'B38789013', 'Distribuidor', 'Polígono Industrial 25', 'Santa Cruz', '38010', 'Santa Cruz de Tenerife', '922245678', 'compras@laisla.com', 'Roberto Diaz', 20.00, 'Cadena de supermercados', true, 'Polígono Industrial 25', 'Polígono Industrial 25', 28.455, -16.290, 'Santa Cruz')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000010', 'Restaurante La Hacienda', 'B38890124', 'Restaurante', 'Camino de La Hacienda 8', 'Los Realejos', '38410', 'Santa Cruz de Tenerife', '922340567', 'reservas@lahacienda.com', 'Carmen Suarez', 12.00, 'Restaurante de lujo', true, 'Camino de La Hacienda 8', 'Camino de La Hacienda 8', 28.385, -16.580, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000011', 'Hotel Rural Finca Salamanca', 'B38901235', 'Hotel', 'Camino de Salamanca 5', 'Güímar', '38500', 'Santa Cruz de Tenerife', '922514300', 'info@fincasalamanca.com', 'Antonio Ramirez', 10.00, 'Hotel rural boutique', true, 'Camino de Salamanca 5', 'Camino de Salamanca 5', 28.310, -16.420, 'Sur')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000012', 'Bodega y Tasca El Lagar', 'B38012346', 'Restaurante', 'C/ El Lagar 23', 'Tacoronte', '38350', 'Santa Cruz de Tenerife', '922560123', 'contacto@ellagar.com', 'Francisco Morales', 8.00, 'Especialidad en vinos locales', true, 'C/ El Lagar 23', 'C/ El Lagar 23', 28.475, -16.415, 'Norte')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000013', 'Catering Eventos Premium', 'B38123457', 'Catering', 'Polígono El Mayorazgo 45', 'Santa Cruz', '38110', 'Santa Cruz de Tenerife', '922289456', 'pedidos@eventospremium.com', 'Laura Navarro', 15.00, 'Eventos corporativos', true, 'Polígono El Mayorazgo 45', 'Polígono El Mayorazgo 45', 28.450, -16.300, 'Santa Cruz')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000014', 'Club Náutico Radazul', 'B38234568', 'Club', 'Muelle Deportivo s/n', 'El Rosario', '38130', 'Santa Cruz de Tenerife', '922680234', 'administracion@cnradazul.com', 'Javier Ortega', 10.00, 'Club náutico', true, 'Muelle Deportivo s/n', 'Muelle Deportivo s/n', 28.405, -16.325, 'Santa Cruz')");
                                jdbcTemplate.execute(
                                                "INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, direccion_facturacion, direccion_envio, latitud, longitud, zona) VALUES ('c1000000-0000-0000-0000-000000000015', 'Restaurante Mirador de Garachico', 'B38345679', 'Restaurante', 'Plaza de la Libertad 1', 'Garachico', '38450', 'Santa Cruz de Tenerife', '922830000', 'info@miradorgarachico.com', 'Elena Castro', 12.00, 'Vistas al mar', true, 'Plaza de la Libertad 1', 'Plaza de la Libertad 1', 28.370, -16.765, 'Norte')");

                                // Insert 20 wines with the exact specified information
                                String insertVino = "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, stock, descripcion, nota_cata, aroma, sabor, variedad_uva, premios, temperatura_servicio, potencial_guarda, stock_minimo, botellas_por_caja, formato_venta, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                                // 1. Táganan Tinto
                                jdbcTemplate.update(insertVino, "v1000001", "ENV-TAG-001", "Táganan Tinto", "Envínate",
                                                "Tinto", 2023, 29.35, "Vinos Atlánticos (Tenerife)", 12.5, 24,
                                                "Vino de culto elaborado por el equipo de Envínate en la zona de Taganana (Anaga). Viñedos centenarios salvajes plantados en pie franco directamente sobre el acantilado y el océano Atlántico.",
                                                "Color rubí brillante de capa media, con ribetes violáceos muy vivos.",
                                                "Nariz marcadamente volcánica, notas de pimienta negra, sangre, fruta roja fresca y salitre.",
                                                "Entrada vertical y eléctrica. Acidez vibrante, cuerpo medio y un final salino muy persistente.",
                                                "Listán Negro, Negramoll, Listán Gacho, Vijariego.",
                                                "94 Puntos Parker.", "15-16ºC", "10-15 años", 6, 6, "BOTELLA",
                                                "/images/vinos/taganan-tinto.jpg");

                                // 2. Eidan Tinto Selección
                                jdbcTemplate.update(insertVino, "v1000002", "VEN-EID-002", "Eidan Tinto Selección",
                                                "Bodega Ventura", "Tinto", 2023, 30.00, "Gran Canaria", 13.0, 18,
                                                "Vino de parcela procedente de viñedos viejos en la zona del Monte Lentiscal. Representa la nueva ola de vinos de calidad de Gran Canaria.",
                                                "Rojo picota de capa media con lágrima fluida.",
                                                "Muy floral (violetas), fruta roja ácida (grosella) y un fondo especiado sutil.",
                                                "Sedoso y pulido. Taninos muy finos, sensación de tiza en el paladar y final fresco.",
                                                "100% Listán Negro.", "Medalla de Oro Agrocanarias.", "14-16ºC",
                                                "5-7 años", 6, 6, "BOTELLA", "/images/vinos/eidan-tinto.jpg");

                                // 3. Guiri Tinto
                                jdbcTemplate.update(insertVino, "v1000003", "ALB-GUI-003", "Guiri Tinto",
                                                "Alba Viticultores", "Tinto", 2023, 45.33, "Islas Canarias", 13.5, 10,
                                                "Elaborado de forma natural a gran altitud (1.200m). Un tinto radical y auténtico que busca la máxima expresión de la variedad.",
                                                "Color cereza intenso, limpio y brillante.",
                                                "Explosión de fruta negra silvestre, hierbas de monte bajo y fondo balsámico.",
                                                "Intenso, con nervio y garra. Acidez muy marcada típica de la altura y final largo.",
                                                "100% Listán Negro.", "93 Puntos Guía Peñín.", "15-17ºC", "8-10 años",
                                                3, 6, "BOTELLA", "/images/vinos/guiri-tinto.jpg");

                                // 4. Uwe Urbach Tinto
                                jdbcTemplate.update(insertVino, "v1000004", "UWE-ECO-004", "Uwe Urbach Tinto",
                                                "Uwe Urbach", "Tinto", 2022, 19.60, "El Hierro", 12.5, 30,
                                                "Vino ecológico de pequeña producción en El Hierro. Refleja el carácter volcánico, rústico y salvaje de la isla.",
                                                "Color púrpura vibrante con ribete azulado.",
                                                "Fragancia frutal intensa (moras, arándanos) y toques de piedra negra caliente.",
                                                "Ligero, fluido y muy sápido. Tanino apenas perceptible, muy fácil de beber.",
                                                "Negramoll, Vijariego Negro, Baboso Negro.", "Certificación Ecológica.",
                                                "14ºC", "3-5 años", 6, 6, "BOTELLA",
                                                "/images/vinos/uwe-urbach-tinto.jpg");

                                // 5. Viñarda Tinto Varietal
                                jdbcTemplate.update(insertVino, "v1000005", "VIN-VAR-005", "Viñarda Tinto Varietal",
                                                "Bodegas Viñarda", "Tinto", 2021, 18.18, "La Palma", 13.0, 40,
                                                "Tinto elaborado con las tres variedades \"estrella\" del noroeste de La Palma. Un coupage tradicional lleno de historia.",
                                                "Rojo granate de capa media-alta.",
                                                "Notas de higos secos, fresa madura y recuerdos de tabaco de pipa.",
                                                "Envolvente y untuoso. Entrada cálida con un final especiado muy agradable.",
                                                "Castellana, Vijariego, Listán Prieto.", "Plata en Alhóndiga.", "16ºC",
                                                "4-6 años", 12, 12, "BOTELLA", "/images/vinos/vinarda-tinto.jpg");

                                // 6. Paisaje de Las Islas
                                jdbcTemplate.update(insertVino, "v1000006", "TAJ-PAI-006", "Paisaje de Las Islas",
                                                "Tajinaste", "Blanco", 2023, 23.25, "Islas Canarias", 13.0, 35,
                                                "Proyecto que une variedades de distintas islas. Vino complejo con crianza sobre lías.",
                                                "Amarillo dorado, limpio y brillante.",
                                                "Muy complejo, piña almibarada, mango y toques de hinojo y panadería.",
                                                "Entrada seca pero golosa. Mucho volumen en boca, graso y con acidez final refrescante.",
                                                "50% Malvasía Aromática, 50% Marmajuelo.", "91 Puntos Parker.",
                                                "10-12ºC", "5-8 años", 6, 6, "BOTELLA",
                                                "/images/vinos/paisaje-islas-blanco.jpg");

                                // 7. Tajinaste Rosado
                                jdbcTemplate.update(insertVino, "v1000007", "TAJ-ROS-007", "Tajinaste Rosado",
                                                "Bodegas Tajinaste", "Rosado", 2024, 15.60, "Valle de la Orotava", 12.0,
                                                60,
                                                "Uno de los rosados más vendidos de Canarias. Elaborado mediante sangrado directo tras una maceración corta en frío.",
                                                "Rojo cereza vivo y muy brillante.",
                                                "Aromas limpios de fruta roja ácida (fresa, frambuesa) con toques de golosina y lácteos.",
                                                "Bastante graso y con volumen en boca. Acidez muy fresca y final afrutado medio.",
                                                "100% Listán Negro.", "Medalla de Oro Guía de Vinos de Canarias.",
                                                "8-10ºC", "2 años", 12, 6, "BOTELLA",
                                                "/images/vinos/tajinaste-rosado.jpg");

                                // 8. Tajinaste Tinto Tradicional
                                jdbcTemplate.update(insertVino, "v1000008", "TAJ-TRA-008",
                                                "Tajinaste Tinto Tradicional", "Bodegas Tajinaste", "Tinto", 2023,
                                                15.60, "Valle de la Orotava", 13.5, 100,
                                                "El tinto de referencia del Valle de la Orotava. Elaborado con sistema de cordón trenzado tradicional.",
                                                "Cereza picota con ribete violáceo joven.",
                                                "Aromas limpios a frutos del bosque, pimienta blanca y toque mineral.",
                                                "Suave, fresco y muy equilibrado. Tanino amable y paso fácil.",
                                                "100% Listán Negro.", "Mejor Vino Joven Canarias.", "14-15ºC",
                                                "3-4 años", 24, 12, "BOTELLA",
                                                "/images/vinos/tajinaste-tradicional.jpg");

                                // 9. Gloc Ancestral Blanco
                                jdbcTemplate.update(insertVino, "v1000009", "GLO-ANC-009", "Gloc Ancestral Blanco",
                                                "Vinos Gloc", "Espumoso", 2020, 29.77, "Bierzo", 12.0, 12,
                                                "Espumoso natural (Pét-Nat) del Bierzo. Uvas orgánicas y fermentación espontánea.",
                                                "Amarillo pálido, burbuja fina y constante.",
                                                "Notas de levadura fresca, manzana verde asada y cítricos.",
                                                "Fresco y crujiente. Carbónico bien integrado y final seco.",
                                                "100% Palomino Fino.", "90 Puntos Parker.", "6-8ºC",
                                                "Consumo inmediato", 6, 6, "BOTELLA",
                                                "/images/vinos/gloc-espumoso-blanco.jpg");

                                // 10. Vidueño Ancestral
                                jdbcTemplate.update(insertVino, "v1000010", "VID-ANC-010", "Vidueño Ancestral",
                                                "Bodegas Vidueño", "Espumoso", 2023, 24.95, "Tenerife", 11.5, 20,
                                                "Método ancestral elaborado con un coupage de campo de variedades autóctonas canarias.",
                                                "Turbidez ligera (natural), color amarillo pajizo.",
                                                "Chispeante, fruta blanca, flores de azahar y notas de pan fermentando.",
                                                "Burbuja viva y cosquilleante. Muy refrescante, acidez alta y trago largo.",
                                                "Listán Blanco, Verdello, Marmajuelo.", "Novedad de mercado.", "6-8ºC",
                                                "1-2 años", 6, 6, "BOTELLA", "/images/vinos/vidueno-ancestral.jpg");

                                // 11. Clandestina Ancestral Confiscat
                                jdbcTemplate.update(insertVino, "v1000011", "CLA-CON-011",
                                                "Clandestina Ancestral Confiscat", "Clandestina", "Espumoso", 2021,
                                                21.96, "Penedès (Sin D.O.)", 11.0, 24,
                                                "Espumoso natural de viñedos ecológicos de 53 años. Sin sulfitos añadidos ni filtrado.",
                                                "Amarillo limón con reflejos verdosos.",
                                                "Vibrante y natural. Hinojo, anís y fruta blanca madura.",
                                                "Acidez equilibrada, toque cremoso por las lías y final almendrado.",
                                                "100% Xarel·lo.", "Icono Vinos Naturales.", "7-9ºC", "2-3 años", 6, 6,
                                                "BOTELLA", "/images/vinos/clandestina-ancestral.jpg");

                                // 12. Disfrutando 0,0 Espumoso
                                jdbcTemplate.update(insertVino, "v1000012", "JUA-DIS-012", "Disfrutando 0,0 Espumoso",
                                                "Bodegas Juan Gil", "Dulce (Sin Alcohol)", 2023, 10.51, "España", 0.0,
                                                60,
                                                "Alternativa perfecta sin alcohol. manteniendo los aromas primarios de la uva Verdejo sin perder calidad.",
                                                "Amarillo pálido con burbuja media.",
                                                "Notas cítricas (lima-limón) y flores blancas (jazmín).",
                                                "Paso suave, dulce y amable. Refrescante sin el calor del alcohol.",
                                                "100% Verdejo.", "N/A", "4-6ºC", "1 año", 12, 6, "BOTELLA",
                                                "/images/vinos/disfrutando-00.jpg");

                                // 13. Moscatel Promesa
                                jdbcTemplate.update(insertVino, "v1000013", "VAL-PRO-013", "Moscatel Promesa",
                                                "Valdespino", "Fortificado", 2020, 24.35, "Jerez-Xérès-Sherry", 17.0,
                                                15,
                                                "Un clásico jerezano monovarietal. Envejecido en sistema tradicional de soleras y criaderas.",
                                                "Color caoba claro con bordes ambarinos.",
                                                "Intenso a miel, piel de naranja confitada, pasas y especias dulces.",
                                                "Dulce, aterciopelado pero sorprendentemente fresco y ligero.",
                                                "100% Moscatel de Alejandría.", "92 Puntos Parker.", "10-12ºC",
                                                "Eterno", 6, 6, "BOTELLA", "/images/vinos/moscatel-promesa.jpg");

                                // 14. Juan Gil Bruto (1.5L)
                                jdbcTemplate.update(insertVino, "v1000014", "JUA-BRU-014", "Juan Gil Bruto (1.5L)",
                                                "Bodegas Juan Gil", "Tinto", 2022, 83.15, "Jumilla", 15.5, 5,
                                                "Formato Magnum (1.5 litros). Un tinto contundente, solar y mediterráneo para grandes ocasiones.",
                                                "Rojo picota muy intenso, casi opaco.",
                                                "Fruta negra muy madura (mermelada), cacao puro, torrefactos y grafito.",
                                                "Potente, estructurado y cálido. Taninos maduros y final larguísimo.",
                                                "100% Monastrell.", "93 Puntos Peñín.", "16-18ºC", "10-15 años", 2, 1,
                                                "MAGNUM 1.5L", "/images/vinos/juan-gil-bruto.jpg");

                                // 15. Pedrera Tinto
                                jdbcTemplate.update(insertVino, "v1000015", "JUA-PED-015", "Pedrera Tinto",
                                                "Juan Gil Family", "Tinto", 2024, 7.50, "Jumilla", 13.5, 150,
                                                "El tinto joven \"de batalla\" de calidad de la familia Gil. diseñado para el copeo diario.",
                                                "Granate vivo con ribete violáceo.",
                                                "Fruta roja y negra fresca, notas florales sencillas.",
                                                "Buena acidez, taninos ligeros y un toque dulce final.",
                                                "100% Monastrell.", "Best Value Selection.", "14-15ºC", "2 años", 24,
                                                12, "BOTELLA", "/images/vinos/pedrera-tinto.jpg");

                                // 16. Tuets Brutal
                                jdbcTemplate.update(insertVino, "v1000016", "TUE-BRU-016", "Tuets Brutal",
                                                "Celler Tuets", "Tinto", 2021, 21.00, "Tarragona (Sin D.O.)", 12.5, 8,
                                                "Vino natural radical. Sin sulfitos añadidos, sin filtrar ni clarificar. Para paladares aventureros.",
                                                "Color oscuro, turbio pero brillante.",
                                                "Notas \"funky\", volátil integrada, fruta salvaje, cuero y especias.",
                                                "Ligero, eléctrico y con una acidez volátil.",
                                                "Syrah, Garnacha, Chenin Blanc.", "Cult Wine Status.", "12-14ºC",
                                                "3-5 años", 3, 6, "BOTELLA", "/images/vinos/tuets-brutal.jpg");

                                // 17. Guiri Ancestral Tinto
                                jdbcTemplate.update(insertVino, "v1000017", "ALB-ANC-017", "Guiri Ancestral Tinto",
                                                "Alba Viticultores", "Espumoso", 2023, 49.30, "Islas Canarias", 13.5, 6,
                                                "Una rareza absoluta: Espumoso tinto método ancestral (Pét-Nat) de Listán Negro a 1200 metros.",
                                                "Rojo vivo con espuma rosada abundante.",
                                                "Fruta roja crujiente (granada), notas rústicas y terrosas.",
                                                "Seco, mucha frescura, burbuja cosquilleante y sabor vinoso.",
                                                "100% Listán Negro.", "Rareza del Año.", "8-10ºC", "2 años", 2, 6,
                                                "BOTELLA", "/images/vinos/guiri-ancestral-tinto.jpg");

                                // 18. Monje Tradicional
                                jdbcTemplate.update(insertVino, "v1000018", "MON-TRA-018", "Monje Tradicional",
                                                "Bodegas Monje", "Tinto", 2022, 15.70, "Tacoronte-Acentejo", 13.0, 60,
                                                "El clásico tinto joven del norte de Tenerife que nunca falla. Refleja la tradición de mezclar variedades.",
                                                "Rojo rubí de capa media.",
                                                "Aroma inconfundible a minerales, tierra húmeda y fruta roja.",
                                                "Seco, con el amargor característico volcánico y buena acidez.",
                                                "Listán Negro, Negramoll, Listán Blanco.", "Bacchus de Plata.",
                                                "14-15ºC", "3 años", 12, 12, "BOTELLA",
                                                "/images/vinos/monje-tradicional.jpg");

                                // 19. Gloc Ancestral Rosado
                                jdbcTemplate.update(insertVino, "v1000019", "GLO-ROS-019", "Gloc Ancestral Rosado",
                                                "Vinos Gloc", "Espumoso", 2019, 30.33, "Bierzo", 11.5, 10,
                                                "Rosado espumoso de larga crianza. demuestra la capacidad de guarda de los ancestrales.",
                                                "Color piel de cebolla con burbuja muy fina.",
                                                "Complejo. Fruta roja madura, bollería fina (brioche) y notas silvestres.",
                                                "Estructurado y vinoso. Carbónico cremoso y final seco.",
                                                "Mencía, Palomino Fino.", "91 Puntos Parker.", "8-10ºC",
                                                "Consumo inmediato", 3, 6, "BOTELLA",
                                                "/images/vinos/gloc-espumoso-rosado.jpg");

                                // 20. Pedrera Rosado
                                jdbcTemplate.update(insertVino, "v1000020", "JUA-ROS-020", "Pedrera Rosado",
                                                "Juan Gil Family", "Rosado", 2023, 7.95, "Jumilla", 13.0, 80,
                                                "Rosado joven, fresco y muy económico. Ideal para el verano y el consumo desenfadado.",
                                                "Color frambuesa pálido y brillante.",
                                                "Nariz golosa de grosella, naranja sanguina y un toque de pimienta blanca.",
                                                "Entrada dulce pero paso fresco y equilibrado.", "Monastrell, Syrah.",
                                                "Top Ventas Verano.", "8-10ºC", "1 año", 24, 12, "BOTELLA",
                                                "/images/vinos/pedrera-rosado.jpg");

                                // Maridajes Insertion
                                String insertMaridaje = "INSERT INTO vino_maridajes (vino_id, maridaje) VALUES (?, ?)";

                                jdbcTemplate.update(insertMaridaje, "v1000001", "Cabrito");
                                jdbcTemplate.update(insertMaridaje, "v1000001", "Pescado azul a la espalda");
                                jdbcTemplate.update(insertMaridaje, "v1000001", "Quesos ahumados");

                                jdbcTemplate.update(insertMaridaje, "v1000002", "Atún rojo");
                                jdbcTemplate.update(insertMaridaje, "v1000002", "Cochino negro canario");

                                jdbcTemplate.update(insertMaridaje, "v1000003", "Guisos de carne");
                                jdbcTemplate.update(insertMaridaje, "v1000003", "Quesos muy curados");

                                jdbcTemplate.update(insertMaridaje, "v1000004", "Queso herreño");
                                jdbcTemplate.update(insertMaridaje, "v1000004", "Verduras asadas");

                                jdbcTemplate.update(insertMaridaje, "v1000005", "Conejo en salmorejo");
                                jdbcTemplate.update(insertMaridaje, "v1000005", "Potajes de berros");

                                jdbcTemplate.update(insertMaridaje, "v1000006", "Quesos semicurados");
                                jdbcTemplate.update(insertMaridaje, "v1000006", "Pescado al horno");

                                jdbcTemplate.update(insertMaridaje, "v1000007", "Sushi");
                                jdbcTemplate.update(insertMaridaje, "v1000007", "Verduras en tempura");

                                jdbcTemplate.update(insertMaridaje, "v1000008", "Carnes a la brasa");
                                jdbcTemplate.update(insertMaridaje, "v1000008", "Tapeo canario");

                                jdbcTemplate.update(insertMaridaje, "v1000009", "Aperitivos");
                                jdbcTemplate.update(insertMaridaje, "v1000009", "Sushi");

                                jdbcTemplate.update(insertMaridaje, "v1000010", "Entrantes fritos");
                                jdbcTemplate.update(insertMaridaje, "v1000010", "Pescado");

                                jdbcTemplate.update(insertMaridaje, "v1000011", "Quesos de pasta blanda");
                                jdbcTemplate.update(insertMaridaje, "v1000011", "Comida asiática");

                                jdbcTemplate.update(insertMaridaje, "v1000013", "Helado de vainilla");
                                jdbcTemplate.update(insertMaridaje, "v1000013", "Foie");

                                jdbcTemplate.update(insertMaridaje, "v1000014", "Caza mayor");
                                jdbcTemplate.update(insertMaridaje, "v1000014", "Asados de cordero");

                                jdbcTemplate.update(insertMaridaje, "v1000015", "Pasta boloñesa");
                                jdbcTemplate.update(insertMaridaje, "v1000015", "Embutidos");

                                jdbcTemplate.update(insertMaridaje, "v1000018", "Pescado salado con mojo");
                                jdbcTemplate.update(insertMaridaje, "v1000018", "Gofio escaldado");

                                jdbcTemplate.update(insertMaridaje, "v1000019", "Salmón ahumado");
                                jdbcTemplate.update(insertMaridaje, "v1000019", "Arroces de carne");

                                jdbcTemplate.update(insertMaridaje, "v1000020", "Ensalada César");
                                jdbcTemplate.update(insertMaridaje, "v1000020", "Aperitivos");

                                System.out.println("✅ Data seeding completed successfully.");
                        }
                };
        }
}
