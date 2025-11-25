-- ============================================
-- SISTEMA DE USUARIOS CON ID/USERNAME
-- ============================================

-- Tabla de usuarios del sistema (no usar auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL, -- ID de usuario para login (ej: "admin", "fran")
  password_hash TEXT NOT NULL, -- Hash de la contraseña
  nombre TEXT NOT NULL,
  apellidos TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('Admin', 'Comercial', 'Almacén')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.usuarios(id), -- Quién creó este usuario
  ultimo_acceso TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON public.usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON public.usuarios(activo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_usuarios_updated_at();

-- RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Todos los usuarios activos pueden ver usuarios
CREATE POLICY "Usuarios pueden ver usuarios"
  ON public.usuarios
  FOR SELECT
  USING (activo = true);

-- Política: Solo admins pueden crear usuarios
CREATE POLICY "Solo admins pueden crear usuarios"
  ON public.usuarios
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND rol = 'Admin'
      AND activo = true
    )
  );

-- Política: Solo admins pueden actualizar usuarios
CREATE POLICY "Solo admins pueden actualizar usuarios"
  ON public.usuarios
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND rol = 'Admin'
      AND activo = true
    )
  );

-- Política: Solo admins pueden eliminar usuarios (desactivar)
CREATE POLICY "Solo admins pueden eliminar usuarios"
  ON public.usuarios
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND rol = 'Admin'
      AND activo = true
    )
  );

-- ============================================
-- INSERTAR USUARIOS INICIALES
-- ============================================

-- Nota: Las contraseñas están hasheadas con bcrypt
-- Para generar hash de contraseña en PostgreSQL necesitamos la extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Usuario Admin (username: admin, password: admin)
-- Hash generado: $2a$10$... (este es un ejemplo, necesitarás generar el real)
INSERT INTO public.usuarios (username, password_hash, nombre, apellidos, rol, activo)
VALUES (
  'admin',
  crypt('admin', gen_salt('bf')), -- Genera hash bcrypt de 'admin'
  'Administrador',
  'Sistema',
  'Admin',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Usuario Fran (username: fran, password: fran)
INSERT INTO public.usuarios (username, password_hash, nombre, apellidos, rol, activo)
VALUES (
  'fran',
  crypt('fran', gen_salt('bf')), -- Genera hash bcrypt de 'fran'
  'Francisco',
  'García',
  'Comercial',
  true
)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- FUNCIÓN PARA VALIDAR LOGIN
-- ============================================

-- Función para verificar credenciales y devolver usuario
CREATE OR REPLACE FUNCTION public.login_usuario(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  nombre TEXT,
  apellidos TEXT,
  rol TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.nombre,
    u.apellidos,
    u.rol
  FROM public.usuarios u
  WHERE u.username = p_username
    AND u.password_hash = crypt(p_password, u.password_hash)
    AND u.activo = true;
    
  -- Actualizar último acceso si se encontró el usuario
  UPDATE public.usuarios
  SET ultimo_acceso = NOW()
  WHERE usuarios.username = p_username
    AND usuarios.password_hash = crypt(p_password, usuarios.password_hash)
    AND usuarios.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA CREAR USUARIO (SOLO ADMINS)
-- ============================================

CREATE OR REPLACE FUNCTION public.crear_usuario(
  p_username TEXT,
  p_password TEXT,
  p_nombre TEXT,
  p_apellidos TEXT,
  p_rol TEXT
)
RETURNS UUID AS $$
DECLARE
  v_new_user_id UUID;
BEGIN
  -- Verificar que el usuario que llama es admin
  IF NOT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND rol = 'Admin'
    AND activo = true
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para crear usuarios';
  END IF;
  
  -- Crear el usuario
  INSERT INTO public.usuarios (username, password_hash, nombre, apellidos, rol, activo, created_by)
  VALUES (
    p_username,
    crypt(p_password, gen_salt('bf')),
    p_nombre,
    p_apellidos,
    p_rol,
    true,
    auth.uid()
  )
  RETURNING id INTO v_new_user_id;
  
  RETURN v_new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA CAMBIAR CONTRASEÑA
-- ============================================

CREATE OR REPLACE FUNCTION public.cambiar_password(
  p_user_id UUID,
  p_old_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_valid BOOLEAN;
BEGIN
  -- Verificar que la contraseña antigua es correcta
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = p_user_id
    AND password_hash = crypt(p_old_password, password_hash)
  ) INTO v_valid;
  
  IF NOT v_valid THEN
    RAISE EXCEPTION 'Contraseña actual incorrecta';
  END IF;
  
  -- Actualizar a la nueva contraseña
  UPDATE public.usuarios
  SET password_hash = crypt(p_new_password, gen_salt('bf'))
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE public.usuarios IS 'Usuarios del sistema VinIA con autenticación por username/password';
COMMENT ON COLUMN public.usuarios.username IS 'ID de usuario para login (único)';
COMMENT ON COLUMN public.usuarios.password_hash IS 'Hash bcrypt de la contraseña';
COMMENT ON COLUMN public.usuarios.rol IS 'Rol del usuario: Admin, Comercial, o Almacén';
COMMENT ON FUNCTION public.login_usuario IS 'Valida credenciales y devuelve datos del usuario';
COMMENT ON FUNCTION public.crear_usuario IS 'Crea un nuevo usuario (solo admins)';
COMMENT ON FUNCTION public.cambiar_password IS 'Cambia la contraseña de un usuario';
