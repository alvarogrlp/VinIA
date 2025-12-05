-- ============================================
-- VinIA - Reparación de Funciones de Lectura
-- ============================================
-- El error "structure of query does not match function result type"
-- puede estar ocurriendo en la función de lectura 'obtener_clientes_comercial'
-- que se llama inmediatamente después de asignar.
--
-- Este script recrea esas funciones asegurando la concordancia de tipos.
-- ============================================

-- 1. Reparar obtener_clientes_comercial
DROP FUNCTION IF EXISTS obtener_clientes_comercial(UUID);

CREATE OR REPLACE FUNCTION obtener_clientes_comercial(p_comercial_id UUID)
RETURNS TABLE (
  cliente_id UUID,
  cliente_nombre TEXT,
  cliente_cif TEXT,
  cliente_tipo TEXT,
  fecha_asignacion TIMESTAMP WITH TIME ZONE,
  num_pedidos BIGINT,
  total_comprado NUMERIC
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nombre,
    c.cif,
    c.tipo,
    acc.fecha_asignacion,
    COUNT(DISTINCT p.id)::BIGINT as num_pedidos,
    COALESCE(SUM(p.total), 0)::NUMERIC as total_comprado
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

-- 2. Reparar obtener_estadisticas_comercial (por si acaso)
DROP FUNCTION IF EXISTS obtener_estadisticas_comercial(UUID);

CREATE OR REPLACE FUNCTION obtener_estadisticas_comercial(p_comercial_id UUID)
RETURNS JSON 
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'comercial_id', u.id,
    'comercial_nombre', u.nombre || ' ' || u.apellidos,
    'total_ventas', COALESCE(SUM(p.total), 0)::NUMERIC,
    'num_pedidos', COUNT(DISTINCT p.id)::BIGINT,
    'num_clientes', COUNT(DISTINCT acc.cliente_id)::BIGINT,
    'ticket_medio', (CASE 
      WHEN COUNT(DISTINCT p.id) > 0 THEN COALESCE(SUM(p.total), 0) / COUNT(DISTINCT p.id)
      ELSE 0 
    END)::NUMERIC
  ) INTO v_result
  FROM usuarios u
  LEFT JOIN asignaciones_cliente_comercial acc ON u.id = acc.comercial_id AND acc.activo = true
  LEFT JOIN pedidos p ON p.cliente_id = acc.cliente_id
  WHERE u.id = p_comercial_id
  GROUP BY u.id, u.nombre, u.apellidos;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
