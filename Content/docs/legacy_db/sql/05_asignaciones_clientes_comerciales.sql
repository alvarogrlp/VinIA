-- ============================================
-- VinIA - Asignaciones de Clientes a Comerciales
-- ============================================
-- Este script crea la tabla para gestionar qué clientes
-- están asignados a cada comercial.
-- Solo los usuarios con rol 'Administración' pueden asignar clientes.
-- ============================================

-- Crear tabla de asignaciones
CREATE TABLE IF NOT EXISTS asignaciones_cliente_comercial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  comercial_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un cliente solo puede estar asignado a un comercial activo a la vez
  UNIQUE(cliente_id, comercial_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_asignaciones_cliente ON asignaciones_cliente_comercial(cliente_id) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_asignaciones_comercial ON asignaciones_cliente_comercial(comercial_id) WHERE activo = true;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_asignaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_asignaciones_updated_at ON asignaciones_cliente_comercial;

CREATE TRIGGER trigger_update_asignaciones_updated_at
  BEFORE UPDATE ON asignaciones_cliente_comercial
  FOR EACH ROW
  EXECUTE FUNCTION update_asignaciones_updated_at();

-- Comentarios
COMMENT ON TABLE asignaciones_cliente_comercial IS 'Asignaciones de clientes a comerciales para control de cartera';
COMMENT ON COLUMN asignaciones_cliente_comercial.activo IS 'Si false, el cliente ya no está asignado a este comercial';

-- ============================================
-- FUNCIÓN: Obtener clientes asignados a un comercial
-- ============================================
CREATE OR REPLACE FUNCTION obtener_clientes_comercial(p_comercial_id UUID)
RETURNS TABLE (
  cliente_id UUID,
  cliente_nombre TEXT,
  cliente_cif TEXT,
  cliente_tipo TEXT,
  fecha_asignacion TIMESTAMP WITH TIME ZONE,
  num_pedidos BIGINT,
  total_comprado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nombre,
    c.cif,
    c.tipo,
    acc.fecha_asignacion,
    COUNT(DISTINCT p.id) as num_pedidos,
    COALESCE(SUM(p.total), 0) as total_comprado
  FROM asignaciones_cliente_comercial acc
  JOIN clientes c ON acc.cliente_id = c.id
  LEFT JOIN pedidos p ON p.cliente_id = c.id
  WHERE acc.comercial_id = p_comercial_id
    AND acc.activo = true
    AND c.activo = true
  GROUP BY c.id, c.nombre, c.cif, c.tipo, acc.fecha_asignacion
  ORDER BY c.nombre;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Obtener estadísticas de un comercial
-- ============================================
CREATE OR REPLACE FUNCTION obtener_estadisticas_comercial(p_comercial_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'comercial_id', u.id,
    'comercial_nombre', u.nombre || ' ' || u.apellidos,
    'total_ventas', COALESCE(SUM(p.total), 0),
    'num_pedidos', COUNT(DISTINCT p.id),
    'num_clientes', COUNT(DISTINCT acc.cliente_id),
    'ticket_medio', CASE 
      WHEN COUNT(DISTINCT p.id) > 0 THEN COALESCE(SUM(p.total), 0) / COUNT(DISTINCT p.id)
      ELSE 0 
    END
  ) INTO v_result
  FROM usuarios u
  LEFT JOIN asignaciones_cliente_comercial acc ON u.id = acc.comercial_id AND acc.activo = true
  LEFT JOIN pedidos p ON p.cliente_id = acc.cliente_id
  WHERE u.id = p_comercial_id
  GROUP BY u.id, u.nombre, u.apellidos;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Asignar cliente a comercial
-- ============================================
CREATE OR REPLACE FUNCTION asignar_cliente_comercial(
  p_cliente_id UUID,
  p_comercial_id UUID,
  p_admin_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_admin_rol TEXT;
  v_asignacion_id UUID;
BEGIN
  -- Verificar que quien asigna es Administración
  SELECT rol INTO v_admin_rol FROM usuarios WHERE id = p_admin_id;
  
  IF v_admin_rol != 'Administración' THEN
    RAISE EXCEPTION 'Solo los usuarios con rol Administración pueden asignar clientes';
  END IF;
  
  -- Desactivar asignación previa del cliente si existe
  UPDATE asignaciones_cliente_comercial
  SET activo = false
  WHERE cliente_id = p_cliente_id AND activo = true;
  
  -- Crear nueva asignación
  INSERT INTO asignaciones_cliente_comercial (cliente_id, comercial_id)
  VALUES (p_cliente_id, p_comercial_id)
  ON CONFLICT (cliente_id, comercial_id) 
  DO UPDATE SET activo = true, fecha_asignacion = NOW()
  RETURNING id INTO v_asignacion_id;
  
  RETURN json_build_object(
    'success', true,
    'asignacion_id', v_asignacion_id,
    'message', 'Cliente asignado correctamente'
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Obtener vinos más vendidos por comercial
-- ============================================
CREATE OR REPLACE FUNCTION obtener_vinos_mas_vendidos_comercial(
  p_comercial_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  vino_id UUID,
  vino_nombre TEXT,
  cantidad_vendida NUMERIC,
  total_vendido NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.nombre,
    SUM(lp.cantidad) as cantidad_vendida,
    SUM(lp.subtotal) as total_vendido
  FROM asignaciones_cliente_comercial acc
  JOIN pedidos p ON p.cliente_id = acc.cliente_id
  JOIN lineas_pedido lp ON lp.pedido_id = p.id
  JOIN vinos v ON v.id = lp.vino_id
  WHERE acc.comercial_id = p_comercial_id
    AND acc.activo = true
  GROUP BY v.id, v.nombre
  ORDER BY cantidad_vendida DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Obtener vinos menos vendidos por comercial
-- ============================================
CREATE OR REPLACE FUNCTION obtener_vinos_menos_vendidos_comercial(
  p_comercial_id UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  vino_id UUID,
  vino_nombre TEXT,
  cantidad_vendida NUMERIC,
  total_vendido NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.nombre,
    SUM(lp.cantidad) as cantidad_vendida,
    SUM(lp.subtotal) as total_vendido
  FROM asignaciones_cliente_comercial acc
  JOIN pedidos p ON p.cliente_id = acc.cliente_id
  JOIN lineas_pedido lp ON lp.pedido_id = p.id
  JOIN vinos v ON v.id = lp.vino_id
  WHERE acc.comercial_id = p_comercial_id
    AND acc.activo = true
  GROUP BY v.id, v.nombre
  ORDER BY cantidad_vendida ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Actualizar constraint de rol en tabla usuarios
-- ============================================
-- PASO 1: Eliminar la restricción antigua
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;

-- PASO 2: Actualizar usuarios existentes ANTES de crear el nuevo constraint
UPDATE usuarios SET rol = 'Administración' WHERE rol = 'Admin';

-- PASO 3: Agregar la nueva restricción con 'Administración'
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check 
  CHECK (rol IN ('Administración', 'Comercial', 'Almacén'));

-- Verificación
SELECT username, nombre, rol FROM usuarios ORDER BY rol, nombre;

-- ============================================
-- DATOS DE PRUEBA (opcional - comentar si no se necesita)
-- ============================================

-- Comentar estas líneas si no quieres datos de prueba
/*
-- Asignar algunos clientes al usuario admin (si existen clientes)
INSERT INTO asignaciones_cliente_comercial (cliente_id, comercial_id)
SELECT c.id, u.id
FROM clientes c
CROSS JOIN usuarios u
WHERE u.username = 'admin' AND c.activo = true
LIMIT 3;
*/
