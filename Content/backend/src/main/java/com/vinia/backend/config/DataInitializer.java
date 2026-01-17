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

                        // Maintain compatibility with previous users from data.sql
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
                                System.out.println("Seeding database with initial data...");

                                // Insert 15 clients (Updated with credit & location columns & zona)
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

                                // Insert 35 wines
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata, botellas_por_caja, formato_venta) VALUES ('v1000000-0000-0000-0000-000000000001', 'VIN-CAN-001', 'Vinatigo Baboso Negro', 'Bodegas Vinatigo', 'Tinto', 2020, 22.90, 'D.O. Valle de La Orotava', 13.50, 'Vino tinto de variedad autoctona', 45, 12, '/images/vinos/baboso-negro.jpg', 'Aromas a frutos rojos maduros', 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata, botellas_por_caja, formato_venta) VALUES ('v1000000-0000-0000-0000-000000000002', 'VIN-CAN-002', 'Vina Norte Listan Blanco', 'Bodegas Vina Norte', 'Blanco', 2022, 14.50, 'D.O. Tacoronte-Acentejo', 11.80, 'Vino blanco joven y fresco', 80, 15, '/images/vinos/vina-norte-blanco.jpg', 'Notes citricas y florales', 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata, botellas_por_caja, formato_venta) VALUES ('v1000000-0000-0000-0000-000000000003', 'VIN-CAN-003', 'Suertes del Marques Trenzado', 'Suertes del Marques', 'Tinto', 2021, 38.00, 'D.O. Valle de La Orotava', 14.00, 'Vino tinto de parcela vieja', 30, 8, '/images/vinos/trenzado.jpg', 'Complejo y elegante', 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata, botellas_por_caja, formato_venta) VALUES ('v1000000-0000-0000-0000-000000000004', 'VIN-CAN-004', 'Tajinaste Tradicional Tinto', 'Bodegas Tajinaste', 'Tinto', 2021, 9.50, 'D.O. Valle de La Orotava', 13.50, 'Vino tinto joven y fresco', 120, 20, '/images/vinos/tajinaste-tinto.jpg', 'Aromas a frutos rojos frescos', 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, nota_cata, botellas_por_caja, formato_venta) VALUES ('v1000000-0000-0000-0000-000000000005', 'VIN-CAN-005', 'Tajinaste Blanco Afrutado', 'Bodegas Tajinaste', 'Blanco', 2022, 8.90, 'D.O. Valle de La Orotava', 12.50, 'Vino blanco joven y afrutado', 150, 25, '/images/vinos/tajinaste-blanco.jpg', 'Notas tropicales y citricas', 6, 'BOTELLA')");

                                // 30 additional wines
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000001', 'VIN-RIB-001', 'Vega Sicilia Unico', 'Bodegas Vega Sicilia', 'Tinto', 2015, 385.00, 'D.O. Ribera del Duero', 14.50, 'Uno de los vinos mas prestigiosos de España', 15, 3, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000002', 'VIN-RIO-001', 'Marques de Riscal Reserva', 'Herederos del Marques de Riscal', 'Tinto', 2018, 18.50, 'D.O.Ca. Rioja', 14.00, 'Clasico de Rioja con crianza en barrica', 60, 15, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000003', 'VIN-RIO-002', 'La Rioja Alta Gran Reserva 904', 'La Rioja Alta', 'Tinto', 2015, 45.00, 'D.O.Ca. Rioja', 13.50, 'Gran Reserva emblematico de Rioja', 25, 5, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000004', 'VIN-PRI-001', 'Aalto', 'Bodegas Aalto', 'Tinto', 2019, 32.00, 'D.O. Ribera del Duero', 15.00, 'Vino moderno de Ribera del Duero', 40, 10, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000005', 'VIN-RUE-001', 'Vatan', 'Bodegas y Vinedos Vatan', 'Tinto', 2018, 28.00, 'D.O. Toro', 15.00, 'Tinta de Toro con gran concentracion', 35, 8, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000006', 'VIN-RIA-001', 'Albarino de Fefiñanes', 'Palacio de Fefiñanes', 'Blanco', 2022, 16.50, 'D.O. Rias Baixas', 12.50, 'Albarino clasico de Rias Baixas', 70, 15, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000007', 'VIN-PRO-001', 'Emilio Moro', 'Bodegas Emilio Moro', 'Tinto', 2020, 22.00, 'D.O. Ribera del Duero', 14.50, 'Tempranillo de gran calidad', 50, 12, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000008', 'VIN-PEN-001', 'Abadia Retuerta Seleccion Especial', 'Abadia Retuerta', 'Tinto', 2019, 26.00, 'V.T. Castilla y Leon', 14.00, 'Blend de variedades internacionales', 30, 8, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000009', 'VIN-NAV-001', 'Chivite Coleccion 125 Reserva', 'Bodegas Chivite', 'Tinto', 2017, 35.00, 'D.O. Navarra', 14.00, 'Reserva premium de Navarra', 25, 6, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000010', 'VIN-SOM-001', 'Dominio de Pingus', 'Dominio de Pingus', 'Tinto', 2018, 650.00, 'D.O. Ribera del Duero', 15.00, 'Vino de culto, produccion limitada', 8, 2, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000011', 'VIN-PRI-002', 'Pesquera Crianza', 'Bodegas Alejandro Fernandez', 'Tinto', 2019, 19.50, 'D.O. Ribera del Duero', 14.00, 'Referente de Ribera del Duero', 55, 12, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000012', 'VIN-RUE-002', 'Alion', 'Bodegas Alion', 'Tinto', 2018, 58.00, 'D.O. Ribera del Duero', 14.50, 'Vino moderno y concentrado', 20, 5, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000013', 'VIN-CAT-001', 'Clos Mogador', 'Clos Mogador', 'Tinto', 2019, 75.00, 'D.O.Q. Priorat', 14.50, 'Gran vino del Priorat', 18, 4, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000014', 'VIN-CAT-002', 'Gramona Imperial Gran Reserva', 'Gramona', 'Espumoso', 2015, 42.00, 'D.O. Cava', 12.00, 'Cava de larga crianza', 30, 8, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000015', 'VIN-RIO-003', 'Muga Reserva', 'Bodegas Muga', 'Tinto', 2018, 24.00, 'D.O.Ca. Rioja', 14.00, 'Clasico de Rioja', 45, 10, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000016', 'VIN-RIA-002', 'Martin Codax', 'Bodegas Martin Codax', 'Blanco', 2022, 11.50, 'D.O. Rias Baixas', 12.50, 'Albarino joven y fresco', 90, 20, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000017', 'VIN-RUE-003', 'Numanthia', 'Bodegas Numanthia', 'Tinto', 2019, 38.00, 'D.O. Toro', 15.00, 'Tinta de Toro potente', 28, 6, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000018', 'VIN-RIO-004', 'Marques de Caceres Crianza', 'Marques de Caceres', 'Tinto', 2019, 12.50, 'D.O.Ca. Rioja', 13.50, 'Rioja accesible y de calidad', 75, 18, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000019', 'VIN-VAL-001', 'Godello Valdesil', 'Bodegas Valdesil', 'Blanco', 2021, 18.00, 'D.O. Valdeorras', 13.00, 'Godello de gran calidad', 40, 10, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000020', 'VIN-JER-001', 'Tio Pepe Fino', 'Gonzalez Byass', 'Fortificado', 2020, 9.50, 'D.O. Jerez', 15.00, 'Fino clasico de Jerez', 100, 25, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000021', 'VIN-PEN-002', 'Mauro', 'Bodegas Mauro', 'Tinto', 2019, 28.00, 'V.T. Castilla y Leon', 14.50, 'Vino de autor reconocido', 32, 8, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000022', 'VIN-CAT-003', 'Mas La Plana', 'Miguel Torres', 'Tinto', 2017, 48.00, 'D.O. Penedes', 13.50, 'Cabernet Sauvignon emblematico', 22, 5, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000023', 'VIN-RIO-005', 'Vina Ardanza Reserva', 'La Rioja Alta', 'Tinto', 2015, 28.00, 'D.O.Ca. Rioja', 13.50, 'Reserva clasico de Rioja', 38, 9, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000024', 'VIN-RUE-004', 'Pintia', 'Bodegas Pintia', 'Tinto', 2018, 32.00, 'D.O. Toro', 15.00, 'Tinta de Toro moderna', 26, 6, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000025', 'VIN-RIA-003', 'Pazo de Senorans', 'Pazo de Senorans', 'Blanco', 2021, 22.00, 'D.O. Rias Baixas', 13.00, 'Albarino de alta gama', 35, 8, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000026', 'VIN-RIO-006', 'Contino Reserva', 'Vinos de Contino', 'Tinto', 2017, 26.00, 'D.O.Ca. Rioja', 14.00, 'Vino de finca unica', 30, 7, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000027', 'VIN-CAT-004', 'Clos Erasmus', 'Clos i Terrasses', 'Tinto', 2018, 95.00, 'D.O.Q. Priorat', 15.00, 'Gran vino del Priorat', 12, 3, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000028', 'VIN-RUE-005', 'Termanthia', 'Bodegas Numanthia', 'Tinto', 2017, 185.00, 'D.O. Toro', 15.50, 'Vino de culto de Toro', 10, 2, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000029', 'VIN-RIO-007', 'Vina Tondonia Reserva', 'Lopez de Heredia', 'Tinto', 2010, 38.00, 'D.O.Ca. Rioja', 13.00, 'Rioja tradicional de larga crianza', 20, 5, 6, 'BOTELLA')");
                                jdbcTemplate.execute(
                                                "INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, botellas_por_caja, formato_venta) VALUES ('v2000000-0000-0000-0000-000000000030', 'VIN-JER-002', 'Matusalem Oloroso Dulce', 'Gonzalez Byass', 'Fortificado', 2015, 28.00, 'D.O. Jerez', 20.00, 'Oloroso dulce de gran complejidad', 25, 6, 6, 'BOTELLA')");

                                System.out.println("✅ Database seeded with initial client and wine data.");
                        }
                };
        }
}
