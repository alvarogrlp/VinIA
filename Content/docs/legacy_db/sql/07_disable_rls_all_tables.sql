-- =====================================================
-- VinIA - Deshabilitar RLS para sistema de Auth Propio
-- =====================================================
-- 
-- Como la aplicación utiliza un sistema de autenticación propio
-- (basado en la tabla 'usuarios' y RPCs) y no utiliza Supabase Auth,
-- las peticiones desde el cliente se realizan con el rol 'anon'.
-- 
-- Las políticas RLS actuales requieren 'authenticated', por lo que
-- bloquean el acceso a los datos.
-- 
-- Este script deshabilita RLS en las tablas principales para permitir
-- que la aplicación funcione con el sistema de auth actual.
-- =====================================================

-- Deshabilitar RLS en Clientes (para que aparezcan en la lista)
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en Pedidos
ALTER TABLE public.pedidos DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en Facturas
ALTER TABLE public.facturas DISABLE ROW LEVEL SECURITY;

-- Deshabilitar RLS en Usuarios (para gestión de usuarios)
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- Asegurarnos que también está deshabilitado en Vinos y Líneas (por si acaso)
ALTER TABLE public.vinos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineas_pedido DISABLE ROW LEVEL SECURITY;

-- Verificación
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('clientes', 'pedidos', 'facturas', 'usuarios', 'vinos', 'lineas_pedido');
