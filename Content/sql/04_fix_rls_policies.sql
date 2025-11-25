-- =====================================================
-- VinIA - Corrección de Políticas RLS
-- =====================================================
-- 
-- Este script corrige las políticas de RLS para permitir
-- acceso anónimo a la tabla de vinos (ya que usamos
-- autenticación personalizada, no Supabase Auth)
--
-- =====================================================

-- Eliminar políticas anteriores
DROP POLICY IF EXISTS "Usuarios pueden leer vinos" ON public.vinos;
DROP POLICY IF EXISTS "Usuarios pueden crear lineas" ON public.lineas_pedido;
DROP POLICY IF EXISTS "Usuarios pueden leer lineas" ON public.lineas_pedido;

-- Deshabilitar RLS temporalmente para desarrollo
-- (En producción deberías configurar políticas adecuadas)
ALTER TABLE public.vinos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineas_pedido DISABLE ROW LEVEL SECURITY;

-- O si prefieres mantener RLS, crear políticas que permitan acceso público
-- ALTER TABLE public.vinos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Permitir lectura pública de vinos" ON public.vinos
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Permitir inserción autenticada de vinos" ON public.vinos
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Permitir actualización autenticada de vinos" ON public.vinos
--   FOR UPDATE USING (true);

-- Verificar que los vinos existen
SELECT COUNT(*) as total_vinos FROM public.vinos;
SELECT COUNT(*) as vinos_activos FROM public.vinos WHERE activo = true;

-- Ver algunos vinos de ejemplo
SELECT 
  codigo_interno,
  nombre,
  bodega,
  tipo,
  precio_unitario,
  stock,
  activo
FROM public.vinos
LIMIT 5;
