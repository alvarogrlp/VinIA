-- ============================================
-- VinIA - Debug Schema
-- ============================================
-- Verificar existencia de tablas y columnas
-- ============================================

DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  -- Verificar tabla pedidos
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'pedidos'
  ) INTO v_exists;
  
  IF NOT v_exists THEN
    RAISE NOTICE 'TABLA PEDIDOS NO EXISTE';
  ELSE
    RAISE NOTICE 'TABLA PEDIDOS EXISTE';
  END IF;

  -- Verificar columna total en pedidos
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'pedidos' AND column_name = 'total'
  ) INTO v_exists;
  
  IF NOT v_exists THEN
    RAISE NOTICE 'COLUMNA TOTAL EN PEDIDOS NO EXISTE';
  ELSE
    RAISE NOTICE 'COLUMNA TOTAL EN PEDIDOS EXISTE';
  END IF;
END;
$$;
