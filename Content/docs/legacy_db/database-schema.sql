-- =====================================================
-- VinIA - Esquema de Base de Datos para Supabase
-- =====================================================
-- 
-- Este archivo contiene el esquema SQL para crear todas
-- las tablas necesarias en Supabase (PostgreSQL)
--
-- Para ejecutar:
-- 1. Ve a tu proyecto en Supabase
-- 2. Abre el Editor SQL
-- 3. Copia y pega este contenido
-- 4. Ejecuta el script
-- =====================================================

-- =====================================================
-- EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: usuarios (profiles)
-- =====================================================
-- Complementa la tabla auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  telefono VARCHAR(20),
  rol VARCHAR(20) NOT NULL DEFAULT 'Comercial' CHECK (rol IN ('Admin', 'Comercial', 'Visor')),
  avatar TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: vinos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(200) NOT NULL,
  bodega VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Tinto', 'Blanco', 'Rosado', 'Espumoso', 'Fortificado', 'Dulce')),
  ano INTEGER NOT NULL,
  precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
  denominacion_origen VARCHAR(100) NOT NULL,
  grado_alcohol DECIMAL(4, 2) NOT NULL CHECK (grado_alcohol >= 0),
  descripcion TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagen_url TEXT,
  maridaje TEXT[], -- Array de strings
  nota_cata TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: clientes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(250) NOT NULL,
  cif VARCHAR(20) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Restaurante', 'Hotel', 'Tienda', 'Distribuidor', 'Particular')),
  direccion TEXT NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(10) NOT NULL,
  provincia VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(150) NOT NULL,
  persona_contacto VARCHAR(200) NOT NULL,
  descuento DECIMAL(5, 2) DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100),
  notas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: pedidos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado VARCHAR(50) NOT NULL DEFAULT 'Borrador' 
    CHECK (estado IN ('Borrador', 'Pendiente', 'Confirmado', 'Enviado', 'Entregado', 'Cancelado')),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  descuento DECIMAL(5, 2) DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100),
  iva DECIMAL(5, 2) DEFAULT 21 CHECK (iva >= 0),
  total DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  notas TEXT,
  fecha_entrega DATE,
  direccion_entrega TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: lineas_pedido
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
-- TABLA: facturas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE RESTRICT,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' 
    CHECK (estado IN ('Pendiente', 'Pagada', 'Vencida', 'Anulada')),
  metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Tarjeta', 'Pagaré', 'Otros')),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  iva DECIMAL(10, 2) NOT NULL CHECK (iva >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES para mejorar rendimiento
-- =====================================================

-- Vinos
CREATE INDEX idx_vinos_bodega ON public.vinos(bodega);
CREATE INDEX idx_vinos_tipo ON public.vinos(tipo);
CREATE INDEX idx_vinos_ano ON public.vinos(ano);
CREATE INDEX idx_vinos_stock ON public.vinos(stock);

-- Clientes
CREATE INDEX idx_clientes_cif ON public.clientes(cif);
CREATE INDEX idx_clientes_tipo ON public.clientes(tipo);
CREATE INDEX idx_clientes_ciudad ON public.clientes(ciudad);
CREATE INDEX idx_clientes_activo ON public.clientes(activo);

-- Pedidos
CREATE INDEX idx_pedidos_cliente ON public.pedidos(cliente_id);
CREATE INDEX idx_pedidos_usuario ON public.pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON public.pedidos(fecha);

-- Lineas pedido
CREATE INDEX idx_lineas_pedido ON public.lineas_pedido(pedido_id);
CREATE INDEX idx_lineas_vino ON public.lineas_pedido(vino_id);

-- Facturas
CREATE INDEX idx_facturas_pedido ON public.facturas(pedido_id);
CREATE INDEX idx_facturas_cliente ON public.facturas(cliente_id);
CREATE INDEX idx_facturas_estado ON public.facturas(estado);
CREATE INDEX idx_facturas_fecha ON public.facturas(fecha);

-- =====================================================
-- FUNCIONES Y TRIGGERS para updated_at
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a las tablas
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vinos_updated_at BEFORE UPDATE ON public.vinos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facturas_updated_at BEFORE UPDATE ON public.facturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineas_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ejemplo - ajustar según necesidades)

-- Usuarios autenticados pueden leer todos los vinos
CREATE POLICY "Usuarios pueden leer vinos" ON public.vinos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuarios autenticados pueden leer todos los clientes
CREATE POLICY "Usuarios pueden leer clientes" ON public.clientes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuarios pueden ver sus propios pedidos o todos si son admin
CREATE POLICY "Usuarios pueden leer pedidos" ON public.pedidos
  FOR SELECT USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND rol = 'Admin'
    )
  );

-- Más políticas según necesidades...

-- =====================================================
-- DATOS DE EJEMPLO (opcional)
-- =====================================================

-- Insertar vinos de ejemplo
INSERT INTO public.vinos (nombre, bodega, tipo, ano, precio, denominacion_origen, grado_alcohol, descripcion, stock, maridaje) VALUES
('Crianza Reserva', 'Bodegas Riojanas', 'Tinto', 2019, 24.99, 'Rioja', 13.5, 'Vino tinto de crianza con carácter elegante y notas frutales.', 150, ARRAY['Carnes rojas', 'Quesos curados']),
('Albariño Premium', 'Bodegas Atlánticas', 'Blanco', 2022, 18.50, 'Rías Baixas', 12.5, 'Blanco fresco con aromas cítricos y minerales.', 200, ARRAY['Pescados', 'Mariscos']),
('Gran Reserva Imperial', 'Viñedos del Norte', 'Tinto', 2016, 45.00, 'Ribera del Duero', 14.0, 'Gran Reserva con crianza prolongada en barrica de roble francés.', 80, ARRAY['Caza', 'Carnes rojas', 'Quesos fuertes']),
('Cava Brut Nature', 'Cavas Mediterráneas', 'Espumoso', 2021, 12.90, 'Cava', 11.5, 'Espumoso seco y elegante, perfecto para aperitivos.', 300, ARRAY['Aperitivos', 'Mariscos', 'Postres']);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- NOTA: Después de ejecutar este script:
-- 1. Ajusta las políticas RLS según tus necesidades de seguridad
-- 2. Crea usuarios de prueba desde el panel de Supabase
-- 3. Inserta más datos de ejemplo si lo deseas
-- 4. Configura las variables de entorno en tu aplicación (.env)
