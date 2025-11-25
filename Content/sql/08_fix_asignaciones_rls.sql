-- =====================================================
-- VinIA - Deshabilitar RLS en tabla de asignaciones
-- =====================================================
-- 
-- Al igual que con las otras tablas, necesitamos deshabilitar RLS
-- en la tabla de asignaciones para que el sistema de auth propio
-- pueda escribir en ella sin ser bloqueado por las políticas de Supabase.
-- =====================================================

ALTER TABLE public.asignaciones_cliente_comercial DISABLE ROW LEVEL SECURITY;

-- Verificación
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'asignaciones_cliente_comercial';
