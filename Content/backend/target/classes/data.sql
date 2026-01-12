-- Clientes
INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, created_at, updated_at) 
VALUES ('c1000000-0000-0000-0000-000000000001', 'Restaurante El Mirador', 'B12345678', 'Restaurante', 'Calle Mayor 10', 'Madrid', '28001', 'Madrid', '912345678', 'contacto@elmirador.com', 'Juan Pérez', 10.00, 'Cliente premium', true, NOW(), NOW());

INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, created_at, updated_at) 
VALUES ('c1000000-0000-0000-0000-000000000002', 'Vinoteca La Barrica', 'B87654321', 'Tienda Especializada', 'Av. Constitución 45', 'Barcelona', '08001', 'Barcelona', '934567890', 'pedidos@labarrica.es', 'Ana García', 15.00, 'Buen pagador', true, NOW(), NOW());

INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, created_at, updated_at) 
VALUES ('c1000000-0000-0000-0000-000000000003', 'Hotel Gran Plaza', 'A11223344', 'Hotel', 'Plaza España 1', 'Sevilla', '41001', 'Sevilla', '954112233', 'compras@granplaza.com', 'Carlos Ruiz', 12.00, 'Solicita factura mensual', true, NOW(), NOW());

INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, created_at, updated_at) 
VALUES ('c1000000-0000-0000-0000-000000000004', 'Catering Delicias', 'B99887766', 'Catering', 'Polígono Industrial Norte 23', 'Valencia', '46001', 'Valencia', '963334455', 'info@cateringdelicias.com', 'Laura M.', 8.00, 'Pedidos grandes puntuales', true, NOW(), NOW());

INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, created_at, updated_at) 
VALUES ('c1000000-0000-0000-0000-000000000005', 'Restaurante Casa Pepe', 'B55443322', 'Restaurante', 'Calle del Pez 4', 'Madrid', '28004', 'Madrid', '915556677', 'reservas@casapepe.com', 'Pepe', 5.00, 'Pago contado', true, NOW(), NOW());

INSERT INTO clientes (id, nombre, cif, tipo, direccion, ciudad, codigo_postal, provincia, telefono, email, persona_contacto, descuento, notas, activo, created_at, updated_at) 
VALUES ('c1000000-0000-0000-0000-000000000006', 'Gourmet Selection', 'A22334455', 'Tienda Online', 'Calle Logística 9', 'Zaragoza', '50001', 'Zaragoza', '976112233', 'proveedores@gourmetsel.com', 'Sofia V.', 18.00, 'Volumen alto', true, NOW(), NOW());


-- Vinos Detailed
INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000001', 
'R2020-001', 
'Viña Ardanza Reserva', 
'La Rioja Alta', 
'Tinto', 
2020, 
24.50, 
'Rioja', 
13.5, 
'Vino tinto reserva de gran calidad. Un clásico renovado que nunca falla.', 
150, 24, 'https://example.com/ardanza.jpg', 6, 'BOTELLA', 
'Rojo picota con borde granate. Limpio y brillante.', 
'80% Tempranillo, 20% Garnacha', 
'16-18ºC', 
'Excelente evolución hasta 2035', 
'Intenso, especiado, balsámico. Notas de coco, vainilla, canela y chocolate mentolado sobre un fondo de frutas rojas maduras.', 
'Estructurado, equilibrado y sedoso. Taninos amables y pulidos. Final largo y retrogusto complejo.', 
'94 Puntos Parker, 95 Puntos Guía Peñín', 
NOW(), NOW()
);

INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000002', 
'B2021-002', 
'Albariño Martín Códax', 
'Martín Códax', 
'Blanco', 
2021, 
14.90, 
'Rías Baixas', 
12.5, 
'El referente del Albariño gallego. Fresco, atlántico y vibrante.', 
80, 12, 'https://example.com/codax.jpg', 6, 'BOTELLA', 
'Amarillo pajizo con reflejos alimonados.', 
'100% Albariño', 
'8-10ºC', 
'Consumo óptimo en 1-3 años', 
'Alta intensidad. Notas cítricas (lima, pomelo), fruta de hueso y recuerdos herbáceos. Fondo salino característico.', 
'Entrada fresca y voluminosa. Paso untuoso, con buena acidez que le da longitud. Retrogusto frutal y persistente.', 
'Medalla de Oro Mundus Vini', 
NOW(), NOW()
);

INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000003', 
'T2019-003', 
'Pago de Carraovejas', 
'Pago de Carraovejas', 
'Tinto', 
2019, 
38.00, 
'Ribera del Duero', 
14.5, 
'Uno de los tintos más demandados de España. Potencia y elegancia.', 
45, 6, 'https://example.com/carraovejas.jpg', 6, 'BOTELLA', 
'Color rojo púrpura intenso.', 
'93% Tinto Fino, 4% Cabernet Sauvignon, 3% Merlot', 
'16ºC', 
'Guarda recomendada 5-10 años', 
'Fruta negra madura, notas florales (violetas) y toques lácteos y tostados de la barrica francesa.', 
'Carnoso, potente pero equilibrado. Taninos maduros y dulces. Final muy largo y persistente.', 
'93 Puntos Suckling', 
NOW(), NOW()
);

INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000004', 
'R2022-004', 
'Protos Verdejo', 
'Bodegas Protos', 
'Blanco', 
2022, 
9.50, 
'Rueda', 
13.0, 
'El verdejo por excelencia. Calidad y precio imbatibles.', 
200, 30, 'https://example.com/protos.jpg', 6, 'BOTELLA', 
'Color amarillo pajizo con matices verdosos.', 
'100% Verdejo', 
'7-10ºC', 
'Consumir joven', 
'Intenso, con aroma a frutas tropicales (piña) y manzana verde. Toques de hinojo y hierba cortada.', 
'Seco, con la acidez justa y el característico amargor final de la variedad Verdejo que invita a seguir bebiendo.', 
'Mejor Verdejo Guía Vinos', 
NOW(), NOW()
);

INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000005', 
'E2018-005', 
'Moët & Chandon Brut Imperial', 
'Moët & Chandon', 
'Espumoso', 
2018, 
45.00, 
'Champagne', 
12.0, 
'El champagne más famoso del mundo. Símbolo de celebración.', 
60, 12, 'https://example.com/moet.jpg', 6, 'BOTELLA', 
'Oro amarillo con reflejos verdosos.', 
'Pinot Noir, Pinot Meunier, Chardonnay', 
'8-10ºC', 
'Listo para beber', 
'Manzana verde y cítricos. Matices minerales y florales (flores blancas). Notas de brioche y nueces frescas.', 
'Paladar generoso y sutilidad. Burbuja fina. Final fresco y duradero.', 
'Wine Spectator 91', 
NOW(), NOW()
);

INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000006', 
'T2021-006', 
'Muga Crianza', 
'Bodegas Muga', 
'Tinto', 
2021, 
19.50, 
'Rioja', 
14.0, 
'Un crianza que se comporta como un reserva. Fermentado en tinas de roble.', 
120, 24, 'https://example.com/muga.jpg', 6, 'BOTELLA', 
'Capa media-alta, color rubí.', 
'Tempranillo, Garnacha, Mazuelo, Graciano', 
'16-18ºC', 
'Hasta 10 años', 
'Frutas del bosque (arábanos, moras). Notas de chocolate, vainilla y especias dulces.', 
'Aterciopelado y equilibrado. Acidez bien integrada. Recuerdos tostados en retronasal.', 
'James Suckling 92', 
NOW(), NOW()
);

INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000007', 
'B2022-007', 
'José Pariente', 
'Bodegas José Pariente', 
'Blanco', 
2022, 
11.00, 
'Rueda', 
13.0, 
'Complejidad y elegancia en un Verdejo superior.', 
90, 12, 'https://example.com/pariente.jpg', 6, 'BOTELLA', 
'Amarillo brillante con reflejos verdosos.', 
'100% Verdejo', 
'8-10ºC', 
'Consumir en 2 años', 
'Muy intenso. Fruta de la pasión, hinojo y monte bajo. Mineral.', 
'Untuoso y goloso. Gran estructura y volumen. Final ligeramente amargo muy elegante.', 
'Guía Gourmets 93', 
NOW(), NOW()
);

INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000008', 
'T2018-008', 
'Vega Sicilia Valbuena 5º', 
'Vega Sicilia', 
'Tinto', 
2018, 
145.00, 
'Ribera del Duero', 
14.5, 
'El hermano pequeño del Único. Un tinto de leyenda.', 
10, 2, 'https://example.com/valbuena.jpg', 3, 'BOTELLA', 
'Cereza picota oscuro.', 
'95% Tinto Fino, 5% Merlot', 
'17-18ºC', 
'Eterno, más de 20 años', 
'Complejidad abrumadora. Fruta madura, tabaco, cuero, especias finas. Mineralidad.', 
'Seda pura. Potencia controlada. Elegante, profundo y con un final interminable.', 
'Parker 96', 
NOW(), NOW()
);

INSERT INTO vinos (id, codigo_interno, nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, stock_minimo, imagen_url, botellas_por_caja, formato_venta, nota_cata, variedad_uva, temperatura_servicio, potencial_guarda, aroma, sabor, premios, created_at, updated_at)
VALUES (
'v1000000-0000-0000-0000-000000000009', 
'E2020-009', 
'Juvé & Camps Reserva de la Familia', 
'Juvé & Camps', 
'Espumoso', 
2020, 
18.00, 
'Cava', 
12.0, 
'Brut Nature Gran Reserva. Clásico imprescindible.', 
40, 6, 'https://example.com/juve.jpg', 6, 'BOTELLA', 
'Dorado pálido con burbuja fina y constante.', 
'Macabeo, Xarel·lo, Parellada', 
'7-8ºC', 
'Consumir ahora', 
'Fruta blanca madura, notas de panadería, tostados y frutos secos.', 
'Seco, cremoso y amplio. Carbónico muy bien integrado. Fresco y persistente.', 
'91 Puntos Peñín', 
NOW(), NOW()
);


-- Maridajes
INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000001', 'Guisos');
INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000001', 'Carnes rojas');

INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000002', 'Mariscos');
INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000002', 'Pescados');

INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000003', 'Asados');
INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000003', 'Quesos curados');

INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000008', 'Caza');
INSERT INTO vino_maridajes (vino_id, maridaje) VALUES ('v1000000-0000-0000-0000-000000000008', 'Carnes maduradas');
