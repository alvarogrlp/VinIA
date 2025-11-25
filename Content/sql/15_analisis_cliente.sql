-- ============================================
-- VinIA - Análisis de Cliente (JSON)
-- ============================================
-- Función para obtener estadísticas completas de un cliente
-- Devuelve un JSON con:
-- 1. Resumen (total gastado, num pedidos, ticket medio)
-- 2. Última compra (fecha, total, items)
-- 3. Top productos (vinos más comprados)
-- 4. Historial de pedidos (lista completa)
-- ============================================

CREATE OR REPLACE FUNCTION obtener_analisis_cliente(p_cliente_id UUID)
RETURNS JSON
SECURITY DEFINER
AS $$
DECLARE
  v_resumen JSON;
  v_ultima_compra JSON;
  v_top_productos JSON;
  v_historial JSON;
BEGIN
  -- 1. Resumen General
  SELECT json_build_object(
    'total_gastado', COALESCE(SUM(total), 0),
    'num_pedidos', COUNT(*),
    'ticket_medio', CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(total), 0) / COUNT(*) ELSE 0 END,
    'pedidos_pendientes', COUNT(*) FILTER (WHERE estado = 'Pendiente')
  ) INTO v_resumen
  FROM pedidos
  WHERE cliente_id = p_cliente_id;

  -- 2. Última Compra
  SELECT json_build_object(
    'fecha', p.fecha,
    'total', p.total,
    'estado', p.estado,
    'items', (
      SELECT json_agg(json_build_object(
        'vino', v.nombre,
        'cantidad', lp.cantidad,
        'precio', lp.precio_unitario
      ))
      FROM lineas_pedido lp
      JOIN vinos v ON lp.vino_id = v.id
      WHERE lp.pedido_id = p.id
    )
  ) INTO v_ultima_compra
  FROM pedidos p
  WHERE p.cliente_id = p_cliente_id
  ORDER BY p.fecha DESC
  LIMIT 1;

  -- 3. Top Productos (Más comprados por cantidad)
  SELECT json_agg(t) INTO v_top_productos
  FROM (
    SELECT 
      v.nombre,
      v.bodega,
      SUM(lp.cantidad) as total_cantidad,
      SUM(lp.subtotal) as total_gastado
    FROM lineas_pedido lp
    JOIN pedidos p ON lp.pedido_id = p.id
    JOIN vinos v ON lp.vino_id = v.id
    WHERE p.cliente_id = p_cliente_id
    GROUP BY v.id, v.nombre, v.bodega
    ORDER BY total_cantidad DESC
    LIMIT 5
  ) t;

  -- 4. Historial de Pedidos
  SELECT json_agg(t) INTO v_historial
  FROM (
    SELECT 
      id,
      numero_pedido,
      fecha,
      estado,
      total,
      (SELECT COUNT(*) FROM lineas_pedido WHERE pedido_id = p.id) as num_items
    FROM pedidos p
    WHERE cliente_id = p_cliente_id
    ORDER BY fecha DESC
  ) t;

  -- Construir respuesta final
  RETURN json_build_object(
    'resumen', v_resumen,
    'ultima_compra', v_ultima_compra,
    'top_productos', COALESCE(v_top_productos, '[]'::json),
    'historial', COALESCE(v_historial, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql;
