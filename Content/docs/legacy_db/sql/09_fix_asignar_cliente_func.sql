-- ============================================
-- VinIA - Corrección Función Asignar Cliente
-- ============================================
-- Actualizamos la función para:
-- 1. Ser SECURITY DEFINER (evitar problemas de permisos)
-- 2. Aceptar tanto 'Administración' como 'Admin' (por compatibilidad)
-- 3. Mejorar el manejo de errores
-- ============================================

CREATE OR REPLACE FUNCTION asignar_cliente_comercial(
  p_cliente_id UUID,
  p_comercial_id UUID,
  p_admin_id UUID
)
RETURNS JSON 
SECURITY DEFINER -- Ejecutar con permisos del creador
AS $$
DECLARE
  v_admin_rol TEXT;
  v_asignacion_id UUID;
BEGIN
  -- Verificar que quien asigna es Administración
  SELECT rol INTO v_admin_rol FROM usuarios WHERE id = p_admin_id;
  
  IF v_admin_rol IS NULL THEN
    RAISE EXCEPTION 'Usuario administrador no encontrado';
  END IF;

  IF v_admin_rol NOT IN ('Administración', 'Admin') THEN
    RAISE EXCEPTION 'Solo los usuarios con rol Administración pueden asignar clientes. Tu rol es: %', v_admin_rol;
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
