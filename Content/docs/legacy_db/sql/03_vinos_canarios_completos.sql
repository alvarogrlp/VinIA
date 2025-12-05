-- =====================================================
-- VinIA - Actualización de Tabla VINOS con Campos Completos
-- =====================================================
-- 
-- Este script:
-- 1. Elimina la tabla vinos anterior (si existe)
-- 2. Crea la nueva tabla con todos los campos necesarios
-- 3. Inserta 20 vinos canarios con información completa
--
-- ⚠️ ADVERTENCIA: Esto eliminará todos los vinos existentes
-- =====================================================

-- =====================================================
-- 1. ELIMINAR TABLA ANTERIOR
-- =====================================================
DROP TABLE IF EXISTS public.lineas_pedido CASCADE;
DROP TABLE IF EXISTS public.vinos CASCADE;

-- =====================================================
-- 2. CREAR TABLA VINOS COMPLETA
-- =====================================================
CREATE TABLE public.vinos (
  -- IDs y metadatos
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_interno VARCHAR(50) UNIQUE NOT NULL,
  codigo_barras VARCHAR(50),
  
  -- Información básica
  nombre VARCHAR(250) NOT NULL,
  bodega VARCHAR(200) NOT NULL,
  region VARCHAR(150) NOT NULL,
  denominacion_origen VARCHAR(150),
  pais VARCHAR(100) DEFAULT 'España',
  ano INTEGER,
  variedad_uva VARCHAR(200),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Tinto', 'Blanco', 'Rosado', 'Espumoso', 'Fortificado', 'Dulce')),
  formato_botella VARCHAR(50) DEFAULT '75 cl',
  grado_alcohol DECIMAL(4, 2) NOT NULL CHECK (grado_alcohol >= 0),
  
  -- Precios e inventario
  precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
  precio_caja DECIMAL(10, 2),
  unidades_por_caja INTEGER DEFAULT 6,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo INTEGER DEFAULT 10,
  
  -- Imágenes y multimedia
  imagen_url TEXT,
  imagen_etiqueta TEXT,
  
  -- Descripción y características organolépticas
  descripcion TEXT,
  notas_cata TEXT,
  aroma TEXT,
  sabor TEXT,
  maridaje TEXT[],
  temperatura_servicio VARCHAR(50),
  
  -- Información avanzada
  estado_conservacion VARCHAR(50) DEFAULT 'Nuevo' CHECK (estado_conservacion IN ('Nuevo', 'Guarda', 'Colección', 'Reserva')),
  potencial_guarda VARCHAR(100),
  anos_guarda_recomendados INTEGER,
  
  -- Puntuaciones y críticas
  puntuacion_parker INTEGER CHECK (puntuacion_parker >= 0 AND puntuacion_parker <= 100),
  puntuacion_penin INTEGER CHECK (puntuacion_penin >= 0 AND puntuacion_penin <= 100),
  puntuacion_guia_proensa INTEGER CHECK (puntuacion_guia_proensa >= 0 AND puntuacion_guia_proensa <= 100),
  notas_criticos TEXT,
  
  -- Información comercial
  margen_comercial DECIMAL(5, 2) DEFAULT 0,
  cliente_objetivo VARCHAR(100) DEFAULT 'General' CHECK (cliente_objetivo IN ('General', 'HORECA', 'Profesional', 'Particular', 'Coleccionista')),
  promocion_activa BOOLEAN DEFAULT FALSE,
  descuento_promocional DECIMAL(5, 2) DEFAULT 0,
  texto_promocion TEXT,
  
  -- Logística y restricciones
  coste_envio DECIMAL(10, 2) DEFAULT 0,
  embalaje_especial BOOLEAN DEFAULT FALSE,
  notas_embalaje TEXT,
  venta_minima_unidades INTEGER DEFAULT 1,
  solo_profesionales BOOLEAN DEFAULT FALSE,
  
  -- Edición y trazabilidad
  edicion_limitada BOOLEAN DEFAULT FALSE,
  numero_botellas_producidas INTEGER,
  numero_botella VARCHAR(50),
  codigo_lote VARCHAR(100),
  
  -- Historial
  historial_precios JSONB,
  valor_estimado_coleccion DECIMAL(10, 2),
  
  -- Control
  activo BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. RECREAR TABLA LINEAS_PEDIDO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.lineas_pedido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  vino_id UUID NOT NULL REFERENCES public.vinos(id) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
  descuento DECIMAL(5, 2) DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ÍNDICES
-- =====================================================
CREATE INDEX idx_vinos_bodega ON public.vinos(bodega);
CREATE INDEX idx_vinos_tipo ON public.vinos(tipo);
CREATE INDEX idx_vinos_ano ON public.vinos(ano);
CREATE INDEX idx_vinos_stock ON public.vinos(stock);
CREATE INDEX idx_vinos_region ON public.vinos(region);
CREATE INDEX idx_vinos_precio ON public.vinos(precio_unitario);
CREATE INDEX idx_vinos_activo ON public.vinos(activo);
CREATE INDEX idx_vinos_destacado ON public.vinos(destacado);
CREATE INDEX idx_lineas_pedido ON public.lineas_pedido(pedido_id);
CREATE INDEX idx_lineas_vino ON public.lineas_pedido(vino_id);

-- =====================================================
-- 5. TRIGGER UPDATED_AT
-- =====================================================
CREATE TRIGGER update_vinos_updated_at BEFORE UPDATE ON public.vinos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================
ALTER TABLE public.vinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineas_pedido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden leer vinos" ON public.vinos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden crear lineas" ON public.lineas_pedido
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden leer lineas" ON public.lineas_pedido
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. DATOS: 20 VINOS CANARIOS COMPLETOS
-- =====================================================

-- VINO 1: Viñátigo Baboso Negro
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, anos_guarda_recomendados,
  puntuacion_parker, puntuacion_penin, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-001',
  'Viñátigo Baboso Negro',
  'Bodegas Viñátigo',
  'Valle de La Orotava, Tenerife',
  'D.O. Valle de La Orotava',
  'España',
  2020,
  'Baboso Negro 100%',
  'Tinto',
  '75 cl',
  13.50,
  22.90,
  137.40,
  45,
  12,
  'Vino tinto de variedad autóctona canaria Baboso Negro. Vinificación tradicional con crianza de 6 meses en barrica de roble francés.',
  'En nariz destacan aromas a frutos rojos maduros, especias dulces y notas florales. En boca es sedoso, con taninos elegantes y final persistente.',
  'Frutos rojos, frambuesa, especias dulces, violetas',
  'Sedoso, taninos suaves, acidez equilibrada, final largo',
  ARRAY['Carnes rojas', 'Quesos semicurados', 'Guisos canarios', 'Carne de cabra'],
  '16-18°C',
  'Nuevo',
  'Consumir en 3-5 años',
  4,
  89,
  NULL,
  'General',
  TRUE,
  TRUE
);

-- VINO 2: Viña Norte Listán Blanco
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-002',
  'Viña Norte Listán Blanco',
  'Bodegas Viña Norte',
  'Tacoronte-Acentejo, Tenerife',
  'D.O. Tacoronte-Acentejo',
  'España',
  2022,
  'Listán Blanco 100%',
  'Blanco',
  '75 cl',
  11.80,
  14.50,
  87.00,
  80,
  15,
  'Vino blanco joven y fresco elaborado con la variedad autóctona Listán Blanco. Fermentación en depósitos de acero inoxidable a temperatura controlada.',
  'Aromáticamente destaca por sus notas cítricas, florales y tropicales. En boca es fresco, ligero y muy agradable.',
  'Cítricos, flores blancas, manzana verde, toque tropical',
  'Fresco, ligero, acidez vibrante, final limpio',
  ARRAY['Pescados', 'Mariscos', 'Quesos frescos', 'Ensaladas', 'Papas arrugadas'],
  '8-10°C',
  'Nuevo',
  'General',
  TRUE,
  TRUE
);

-- VINO 3: Suertes del Marqués Trenzado
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, anos_guarda_recomendados,
  puntuacion_parker, puntuacion_penin, cliente_objetivo, margen_comercial, activo, destacado
) VALUES (
  'VIN-CAN-003',
  'Suertes del Marqués Trenzado',
  'Suertes del Marqués',
  'Valle de La Orotava, Tenerife',
  'D.O. Valle de La Orotava',
  'España',
  2021,
  'Listán Negro, Tintilla, Vijariego Negro',
  'Tinto',
  '75 cl',
  14.00,
  38.00,
  228.00,
  30,
  8,
  'Vino tinto de parcela vieja. Vendimia manual, fermentación con levaduras autóctonas y crianza de 12 meses en barrica de roble francés de 500L.',
  'Complejo y elegante. Aromas a frutas negras, minerales volcánicos, especias y notas herbáceas. En boca es estructurado con taninos pulidos.',
  'Frutas negras, mineralidad volcánica, hierbas aromáticas, pimienta negra',
  'Estructurado, taninos sedosos, acidez viva, largo final mineral',
  ARRAY['Carnes rojas a la parrilla', 'Conejo en salmorejo', 'Quesos curados', 'Cordero'],
  '16-18°C',
  'Guarda',
  'Óptimo 5-8 años',
  6,
  92,
  93,
  'HORECA',
  15.00,
  TRUE,
  TRUE
);

-- VINO 4: Tajinaste Tradicional Tinto
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-004',
  'Tajinaste Tradicional Tinto',
  'Bodegas Tajinaste',
  'Valle de La Orotava, Tenerife',
  'D.O. Valle de La Orotava',
  'España',
  2021,
  'Listán Negro 100%',
  'Tinto',
  '75 cl',
  13.50,
  9.50,
  57.00,
  120,
  20,
  'Vino tinto joven y fresco de la variedad Listán Negro. Ideal para el consumo diario, refleja la tradición vinícola canaria.',
  'Aromas a frutos rojos frescos y flores. En boca es ligero, fresco y muy agradable.',
  'Frutos rojos frescos, fresas, toques florales',
  'Ligero, fresco, taninos suaves, fácil de beber',
  ARRAY['Tapas', 'Carnes blancas', 'Pasta', 'Arroces', 'Embutidos'],
  '14-16°C',
  'General',
  TRUE,
  FALSE
);

-- VINO 5: Tajinaste Blanco Afrutado
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-005',
  'Tajinaste Blanco Afrutado',
  'Bodegas Tajinaste',
  'Valle de La Orotava, Tenerife',
  'D.O. Valle de La Orotava',
  'España',
  2022,
  'Listán Blanco, Gual',
  'Blanco',
  '75 cl',
  12.50,
  8.90,
  53.40,
  150,
  25,
  'Vino blanco joven, fresco y afrutado. Fermentación a baja temperatura para preservar los aromas primarios de las variedades.',
  'Destaca por su intensidad aromática con notas tropicales y cítricas. En boca es fresco y equilibrado.',
  'Frutas tropicales, cítricos, flores blancas',
  'Fresco, afrutado, buena acidez, final limpio',
  ARRAY['Pescados', 'Sushi', 'Ensaladas', 'Mariscos', 'Quesos suaves'],
  '7-9°C',
  'General',
  TRUE,
  FALSE
);

-- VINO 6: Viña Zanata Malvasía Volcánica
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, puntuacion_penin, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-006',
  'Viña Zanata Malvasía Volcánica',
  'Bodegas Viña Zanata',
  'La Palma',
  'D.O. La Palma',
  'España',
  2022,
  'Malvasía Aromática 100%',
  'Blanco',
  '75 cl',
  13.00,
  19.90,
  119.40,
  60,
  12,
  'Vino blanco elaborado con Malvasía Aromática en suelos volcánicos. Fermentación en depósitos de acero y crianza sobre lías finas.',
  'Intenso y aromático. Notas florales, cítricos y toques de miel. En boca es untuoso, con buena acidez y final largo.',
  'Flores blancas, cítricos, miel, toques herbáceos',
  'Untuoso, buena acidez, final persistente',
  ARRAY['Pescados grasos', 'Arroces cremosos', 'Pollo al horno', 'Quesos azules'],
  '9-11°C',
  'Nuevo',
  'Consumir en 2-3 años',
  90,
  'HORECA',
  TRUE,
  TRUE
);

-- VINO 7: El Grifo Malvasía Seco
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-007',
  'El Grifo Malvasía Volcánica Seco',
  'Bodegas El Grifo',
  'La Geria, Lanzarote',
  'D.O. Lanzarote',
  'España',
  2022,
  'Malvasía Volcánica 100%',
  'Blanco',
  '75 cl',
  13.50,
  16.50,
  99.00,
  70,
  15,
  'Vino blanco seco de la emblemática bodega canaria más antigua (1775). Vinificación en depósito de acero inoxidable que resalta la mineralidad volcánica.',
  'Aromáticamente complejo con notas cítricas, flores blancas y mineralidad volcánica. En boca es seco, fresco y mineral.',
  'Cítricos, flores blancas, mineralidad volcánica, hierba fresca',
  'Seco, fresco, mineral, acidez vibrante',
  ARRAY['Pescados', 'Mariscos', 'Sushi', 'Quesos frescos', 'Ceviche'],
  '8-10°C',
  'Nuevo',
  'General',
  TRUE,
  TRUE
);

-- VINO 8: Bermejo Malvasía Volcánica Naturalmente Dulce
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, puntuacion_penin, cliente_objetivo, venta_minima_unidades, activo, destacado
) VALUES (
  'VIN-CAN-008',
  'Bermejo Malvasía Volcánica Naturalmente Dulce',
  'Bodegas Bermejo',
  'Lanzarote',
  'D.O. Lanzarote',
  'España',
  2020,
  'Malvasía Volcánica 100%',
  'Dulce',
  '50 cl',
  15.00,
  32.00,
  192.00,
  25,
  5,
  'Vino dulce natural de vendimia tardía. Las uvas se sobremaduran en la planta alcanzando alta concentración de azúcar. Crianza de 6 meses en barrica.',
  'Complejo y elegante. Aromas a frutas maduras, miel, pasas y toques de caramelo. En boca es dulce pero equilibrado con buena acidez.',
  'Frutas maduras, miel, pasas, caramelo, flores',
  'Dulce, equilibrado, buena acidez, untuoso, largo',
  ARRAY['Postres', 'Foie gras', 'Quesos azules', 'Chocolate', 'Solo'],
  '10-12°C',
  'Guarda',
  'Consumir en 5-10 años',
  92,
  'Coleccionista',
  3,
  TRUE,
  TRUE
);

-- VINO 9: Viñátigo Marmajuelo
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, puntuacion_parker, puntuacion_penin, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-009',
  'Viñátigo Marmajuelo',
  'Bodegas Viñátigo',
  'Valle de La Orotava, Tenerife',
  'D.O. Valle de La Orotava',
  'España',
  2021,
  'Marmajuelo 100%',
  'Blanco',
  '75 cl',
  13.00,
  24.00,
  144.00,
  40,
  10,
  'Vino blanco de variedad autóctona en peligro de extinción. Fermentación con levaduras autóctonas y crianza sobre lías en depósito.',
  'Complejo y mineral. Aromas cítricos, florales y herbáceos con fondo salino. En boca es tenso, con gran acidez y final persistente.',
  'Cítricos, flores blancas, hierbas, mineralidad salina',
  'Tenso, acidez marcada, mineral, final largo',
  ARRAY['Pescados crudos', 'Mariscos', 'Ceviches', 'Ostras', 'Sushi'],
  '8-10°C',
  'Guarda',
  'Óptimo 3-5 años',
  5,
  91,
  'Profesional',
  TRUE,
  TRUE
);

-- VINO 10: Suertes del Marqués 7 Fuentes
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, anos_guarda_recomendados,
  puntuacion_parker, puntuacion_penin, cliente_objetivo, margen_comercial, activo, destacado
) VALUES (
  'VIN-CAN-010',
  'Suertes del Marqués 7 Fuentes',
  'Suertes del Marqués',
  'Valle de La Orotava, Tenerife',
  'D.O. Valle de La Orotava',
  'España',
  2020,
  'Listán Blanco 100%',
  'Blanco',
  '75 cl',
  13.50,
  35.00,
  210.00,
  20,
  5,
  'Vino blanco de parcela única. Viñedo centenario a 400m de altitud. Fermentación espontánea en tinas de castaño de 1000L y crianza de 10 meses sobre lías.',
  'Muy complejo y profundo. Cítricos maduros, flores, mineralidad volcánica y notas de levadura. En boca es amplio, con gran tensión y persistencia extraordinaria.',
  'Cítricos maduros, flores, mineralidad, levaduras, manzana',
  'Amplio, tenso, complejo, mineralidad marcada, final muy largo',
  ARRAY['Pescados nobles', 'Mariscos premium', 'Arroces', 'Aves de corral', 'Quesos curados'],
  '10-12°C',
  'Guarda',
  'Óptimo 5-10 años',
  8,
  93,
  94,
  'Coleccionista',
  20.00,
  TRUE,
  TRUE
);

-- VINO 11: Envínate Táganan Blanco
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, anos_guarda_recomendados,
  puntuacion_parker, puntuacion_penin, cliente_objetivo, venta_minima_unidades, activo, destacado
) VALUES (
  'VIN-CAN-011',
  'Envínate Táganan Blanco',
  'Envínate',
  'Táganan, Tenerife',
  'Vino de la Tierra',
  'España',
  2021,
  'Listán Blanco, Marmajuelo, Albillo Criollo',
  'Blanco',
  '75 cl',
  13.00,
  28.00,
  168.00,
  30,
  6,
  'Vino de autor de viñedos viejos en terrazas volcánicas. Vinificación natural, fermentación espontánea y crianza en fudres viejos de 2000L.',
  'Aromáticamente muy complejo: cítricos, hierbas salvajes, mineralidad atlántica. En boca es vibrante, salino y con gran longitud.',
  'Cítricos, hierbas salvajes, mineralidad atlántica, flores de montaña',
  'Vibrante, salino, acidez eléctrica, tensión, muy largo',
  ARRAY['Pescados salvajes', 'Mariscos crudos', 'Sushi premium', 'Ostras'],
  '9-11°C',
  'Guarda',
  'Óptimo 4-7 años',
  7,
  92,
  93,
  'Coleccionista',
  6,
  TRUE,
  TRUE
);

-- VINO 12: Envínate Táganan Tinto
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, anos_guarda_recomendados,
  puntuacion_parker, puntuacion_penin, cliente_objetivo, venta_minima_unidades, activo, destacado
) VALUES (
  'VIN-CAN-012',
  'Envínate Táganan Tinto',
  'Envínate',
  'Táganan, Tenerife',
  'Vino de la Tierra',
  'España',
  2020,
  'Listán Negro, Tintilla, Vijariego, Baboso',
  'Tinto',
  '75 cl',
  13.50,
  32.00,
  192.00,
  25,
  5,
  'Vino tinto de viñedos antiguos en terrazas atlánticas. Vinificación tradicional, fermentación con racimo entero y crianza en fudres viejos.',
  'Elegante y atlántico. Frutas rojas frescas, hierbas, mineralidad salina. En boca es ligero en alcohol pero intenso en sabor, taninos sedosos.',
  'Frutas rojas frescas, hierbas atlánticas, mineralidad, flores',
  'Ligero pero intenso, taninos sedosos, acidez vibrante, muy largo',
  ARRAY['Pescados grasos', 'Atún rojo', 'Aves', 'Quesos semicurados'],
  '14-16°C',
  'Guarda',
  'Óptimo 5-10 años',
  10,
  91,
  93,
  'Coleccionista',
  6,
  TRUE,
  TRUE
);

-- VINO 13: Viña Zanata Tinto Maceración Carbónica
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-013',
  'Viña Zanata Tinto Maceración Carbónica',
  'Bodegas Viña Zanata',
  'La Palma',
  'D.O. La Palma',
  'España',
  2022,
  'Negramoll, Listán Negro',
  'Tinto',
  '75 cl',
  13.00,
  11.50,
  69.00,
  100,
  18,
  'Vino tinto joven elaborado mediante maceración carbónica. Aromas muy frutales y frescos. Perfecto para consumo diario.',
  'Intenso en nariz con aromas a frutas rojas frescas y toques florales. En boca es ligero, frutal y muy agradable.',
  'Frutas rojas frescas, cereza, frambuesa, flores',
  'Ligero, frutal, taninos suaves, fácil de beber',
  ARRAY['Tapas', 'Embutidos', 'Pasta', 'Pizza', 'Carnes blancas'],
  '13-15°C',
  'General',
  TRUE,
  FALSE
);

-- VINO 14: Borja Pérez Amansa Uno
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, puntuacion_penin, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-014',
  'Borja Pérez Amansa Uno Listán',
  'Borja Pérez',
  'Valle de La Orotava, Tenerife',
  'D.O. Valle de La Orotava',
  'España',
  2021,
  'Listán Blanco 100%',
  'Blanco',
  '75 cl',
  12.50,
  26.00,
  156.00,
  35,
  8,
  'Vino de parcela única en el pago de Los Bermejos. Viñedo centenario en suelo volcánico. Fermentación espontánea y crianza en ánfora de barro.',
  'Complejo y original. Cítricos, hierbas aromáticas, mineralidad y toques oxidativos controlados. En boca es tenso y muy largo.',
  'Cítricos, hierbas, mineralidad volcánica, toque oxidativo',
  'Tenso, mineral, acidez marcada, textura sedosa, largo',
  ARRAY['Pescados grasos', 'Mariscos', 'Arroces', 'Pollo asado'],
  '10-12°C',
  'Guarda',
  'Consumir en 4-6 años',
  91,
  'Profesional',
  TRUE,
  TRUE
);

-- VINO 15: Tamanca Blanco
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-015',
  'Tamanca Blanco',
  'Bodegas Tamanca',
  'Gran Canaria',
  'Vino de la Tierra Gran Canaria',
  'España',
  2022,
  'Listán Blanco, Albillo',
  'Blanco',
  '75 cl',
  12.00,
  13.50,
  81.00,
  90,
  16,
  'Vino blanco joven y fresco de viñedos de medianías. Fermentación a temperatura controlada que preserva los aromas varietales.',
  'Aromas cítricos y florales. En boca es fresco, ligero y equilibrado. Perfecto para el día a día.',
  'Cítricos, flores blancas, manzana verde',
  'Fresco, ligero, acidez equilibrada, final limpio',
  ARRAY['Pescados', 'Ensaladas', 'Tapas', 'Quesos frescos'],
  '8-10°C',
  'General',
  TRUE,
  FALSE
);

-- VINO 16: Los Bermejos Malvasía Volcánica Semi-Dulce
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-016',
  'Los Bermejos Malvasía Semi-Dulce',
  'Bodegas Los Bermejos',
  'Lanzarote',
  'D.O. Lanzarote',
  'España',
  2022,
  'Malvasía Volcánica 100%',
  'Blanco',
  '75 cl',
  14.00,
  18.00,
  108.00,
  55,
  12,
  'Vino blanco semi-dulce de viñedos en hoyo volcánico. Equilibrio perfecto entre azúcar y acidez.',
  'Aromas intensos a flores blancas, frutas tropicales y miel. En boca es semi-dulce, fresco y muy equilibrado.',
  'Flores blancas, frutas tropicales, miel, cítricos',
  'Semi-dulce, fresco, equilibrado, final agradable',
  ARRAY['Foie gras', 'Postres de fruta', 'Quesos azules', 'Aperitivo'],
  '9-11°C',
  'Nuevo',
  'HORECA',
  TRUE,
  TRUE
);

-- VINO 17: Frontón de Oro Tinto Crianza
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-017',
  'Frontón de Oro Tinto Crianza',
  'Bodegas Frontón de Oro',
  'El Hierro',
  'D.O. El Hierro',
  'España',
  2019,
  'Listán Negro, Negramoll',
  'Tinto',
  '75 cl',
  13.50,
  17.50,
  105.00,
  40,
  10,
  'Vino tinto con crianza de 12 meses en barrica de roble americano. Equilibrio entre fruta y madera.',
  'Aromas a frutas rojas maduras, especias dulces y toques de vainilla. En boca es redondo con taninos integrados.',
  'Frutas rojas maduras, especias, vainilla, cacao',
  'Redondo, taninos integrados, equilibrado, final especiado',
  ARRAY['Carnes rojas', 'Guisos', 'Quesos curados', 'Embutidos'],
  '16-18°C',
  'Nuevo',
  'Consumir en 3-4 años',
  'General',
  TRUE,
  FALSE
);

-- VINO 18: Viñátigo Tintilla
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, puntuacion_penin, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-018',
  'Viñátigo Tintilla',
  'Bodegas Viñátigo',
  'Valle de La Orotava, Tenerife',
  'D.O. Valle de La Orotava',
  'España',
  2020,
  'Tintilla 100%',
  'Tinto',
  '75 cl',
  14.00,
  27.00,
  162.00,
  30,
  7,
  'Vino tinto de variedad autóctona muy escasa. Crianza de 8 meses en barrica de roble francés. Producción muy limitada.',
  'Aromas a frutas negras, especias, flores y toques minerales. En boca es elegante, con taninos finos y largo final.',
  'Frutas negras, especias, violetas, mineralidad',
  'Elegante, taninos finos, acidez equilibrada, final largo',
  ARRAY['Carnes rojas', 'Caza menor', 'Quesos curados', 'Cordero'],
  '16-18°C',
  'Guarda',
  'Óptimo 4-7 años',
  90,
  'Profesional',
  TRUE,
  TRUE
);

-- VINO 19: El Grifo Colección Barrica
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, anos_guarda_recomendados,
  puntuacion_penin, cliente_objetivo, margen_comercial, activo, destacado
) VALUES (
  'VIN-CAN-019',
  'El Grifo Colección Barrica',
  'Bodegas El Grifo',
  'La Geria, Lanzarote',
  'D.O. Lanzarote',
  'España',
  2019,
  'Listán Negro 100%',
  'Tinto',
  '75 cl',
  14.00,
  24.00,
  144.00,
  35,
  8,
  'Vino tinto con crianza de 14 meses en barrica de roble francés. Representa la máxima expresión de la Listán Negro de Lanzarote.',
  'Complejo y elegante. Frutas rojas y negras, especias, mineralidad volcánica y notas tostadas. En boca es estructurado y largo.',
  'Frutas rojas y negras, especias, mineralidad, tostados, cacao',
  'Estructurado, taninos pulidos, equilibrado, final persistente',
  ARRAY['Carnes a la brasa', 'Caza', 'Quesos curados', 'Guisos potentes'],
  '16-18°C',
  'Guarda',
  'Óptimo 5-8 años',
  7,
  91,
  'HORECA',
  18.00,
  TRUE,
  TRUE
);

-- VINO 20: Bermejo Diego Tinto
INSERT INTO public.vinos (
  codigo_interno, nombre, bodega, region, denominacion_origen, pais, ano, variedad_uva, tipo,
  formato_botella, grado_alcohol, precio_unitario, precio_caja, stock, stock_minimo,
  descripcion, notas_cata, aroma, sabor, maridaje, temperatura_servicio,
  estado_conservacion, potencial_guarda, puntuacion_penin, cliente_objetivo, activo, destacado
) VALUES (
  'VIN-CAN-020',
  'Bermejo Diego Tinto',
  'Bodegas Bermejo',
  'Lanzarote',
  'D.O. Lanzarote',
  'España',
  2020,
  'Listán Negro 85%, Syrah 15%',
  'Tinto',
  '75 cl',
  14.00,
  21.00,
  126.00,
  45,
  10,
  'Vino tinto con 10 meses de crianza en barrica de roble francés. Fusión perfecta entre variedades autóctonas y foráneas.',
  'Aromas a frutas negras maduras, especias, mineralidad volcánica. En boca es potente pero elegante con taninos maduros.',
  'Frutas negras, especias, mineralidad volcánica, toques balsámicos',
  'Potente, elegante, taninos maduros, acidez equilibrada, largo',
  ARRAY['Carnes rojas', 'Cordero', 'Guisos', 'Quesos semicurados'],
  '16-18°C',
  'Guarda',
  'Consumir en 5-7 años',
  90,
  'HORECA',
  TRUE,
  TRUE
);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- NOTAS:
-- ✅ 20 vinos canarios con información COMPLETA
-- ✅ Todos los campos necesarios para gestión comercial
-- ✅ Precios realistas del mercado canario
-- ✅ Variedades autóctonas destacadas
-- ✅ Información de maridaje detallada
-- ✅ Notas de cata profesionales
-- ✅ Stock y gestión comercial configurados
-- ✅ Marcados vinos destacados para promoción

