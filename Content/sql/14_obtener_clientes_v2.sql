-- ============================================
-- VinIA - Obtener Clientes V2 (JSON)
-- ============================================
-- Versión robusta que devuelve JSON para evitar errores de tipos
-- "structure of query does not match function result type"
-- ============================================

CREATE OR REPLACE FUNCTION obtener_clientes_comercial_v2(p_comercial_id UUID)
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(t) INTO v_result
  FROM (
    SELECT 
      c.id as cliente_id,
      c.nombre as cliente_nombre,
      c.cif as cliente_cif,
      c.tipo as cliente_tipo,
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
    ORDER BY c.nombre
  ) t;

  -- Si no hay resultados, devolver array vacío en lugar de null
  RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;
