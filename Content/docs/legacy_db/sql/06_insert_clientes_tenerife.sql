-- ============================================
-- VinIA - Datos de prueba: Clientes de Tenerife
-- ============================================
-- Inserción de clientes (Restaurantes, Hoteles, etc.) ubicados en Tenerife.
-- ============================================

INSERT INTO clientes (nombre, cif, tipo, direccion, ciudad, codigo_postal, telefono, email, descuento_habitual, activo, notas)
VALUES 
  -- Restaurantes Zona Norte
  ('Restaurante El Calderito de la Abuela', 'B38456789', 'Restaurante', 'Ctra. Provincial, 130', 'Santa Úrsula', '38390', '922 30 11 22', 'info@elcalderito.com', 10, true, 'Cliente preferente zona norte. Especialidad en cocina canaria renovada.'),
  ('Tasca El Granero', 'B38123456', 'Restaurante', 'C/ El Durazno, 45', 'La Orotava', '38300', '922 33 44 55', 'reservas@tascaelgranero.com', 5, true, 'Buen consumo de vinos tintos locales.'),
  ('Bodegón El Drago', 'B38789012', 'Restaurante', 'C/ Marqués de Celada, 2', 'Tegueste', '38280', '922 54 30 01', 'contacto@bodegoneldrago.com', 15, true, 'Histórico. Requiere atención especial en carta de vinos.'),

  -- Hoteles Zona Metropolitana
  ('Iberostar Heritage Grand Mencey', 'A38000111', 'Hotel', 'C/ Dr. Jose Naveiras, 38', 'Santa Cruz de Tenerife', '38004', '922 27 67 00', 'mencey@iberostar.com', 20, true, 'Hotel 5 estrellas. Gran volumen de pedidos para eventos.'),
  ('Silken Atlántida Santa Cruz', 'A38000222', 'Hotel', 'Av. Tres de Mayo, 3', 'Santa Cruz de Tenerife', '38005', '922 29 45 00', 'recepcion.atlantida@hoteles-silken.com', 15, true, 'Pedidos regulares mensuales.'),

  -- Restaurantes Zona Sur
  ('Restaurante Los Roques', 'B38555666', 'Restaurante', 'C/ La Marina, 16', 'Los Abrigos', '38618', '922 74 94 01', 'info@restaurantelosroques.com', 10, true, 'Especialidad en pescados. Consumo alto de blancos y espumosos.'),
  ('El Rincón de Juan Carlos', 'B38999888', 'Restaurante', 'Av. de Moscú, 11 (Royal Hideaway Corales)', 'Adeje', '38679', '922 86 80 40', 'reservas@elrincondejuancarlos.com', 15, true, 'Estrella Michelin. Solo vinos de alta gama.'),
  
  -- Hoteles Zona Sur
  ('Bahía del Duque', 'A38777888', 'Hotel', 'Av. de Bruselas, s/n', 'Adeje', '38660', '922 74 69 00', 'compras@bahia-duque.com', 25, true, 'Gran volumen. Múltiples puntos de venta (restaurantes internos).'),
  ('Hard Rock Hotel Tenerife', 'A38666555', 'Hotel', 'Av. Adeje 300, s/n', 'Adeje', '38670', '922 74 17 00', 'info@hrhtenerife.com', 20, true, 'Consumo alto en barra y eventos.'),

  -- Tiendas y Distribuidores
  ('La Casa del Vino', 'B38222333', 'Tienda', 'Autopista Gral. del Norte, km 21', 'El Sauzal', '38360', '922 57 25 35', 'tienda@casadelvino.com', 10, true, 'Punto de venta turístico importante.'),
  ('Distribuciones Canarias S.L.', 'B38111000', 'Distribuidor', 'Polígono Industrial Los Majuelos', 'San Cristóbal de La Laguna', '38108', '922 82 82 82', 'pedidos@distribucionescanarias.com', 30, true, 'Distribuidor mayorista. Precios especiales.');
