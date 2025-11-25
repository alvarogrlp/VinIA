# 🍷 VinIA - Sistema de Gestión de Vinos

## ✅ Sistema de Autenticación Personalizado Completado

### 📋 Resumen de Cambios

Hemos refactorizado completamente el sistema de autenticación de email (Supabase Auth) a un **sistema personalizado con username/password** con control administrativo.

---

## 🚀 Próximos Pasos Inmediatos

### 1️⃣ **Ejecutar SQL en Supabase** (REQUERIDO)

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor** (en el menú lateral)
3. Abre el archivo `sql/02_usuarios_sistema.sql` de este proyecto
4. Copia TODO el contenido y pégalo en el editor SQL
5. Haz clic en **Run** (o presiona `Ctrl/Cmd + Enter`)
6. Verifica que no hay errores

**Esto creará:**
- ✅ Tabla `usuarios` con hash bcrypt para contraseñas
- ✅ Funciones RPC: `login_usuario`, `crear_usuario`, `cambiar_password`
- ✅ Políticas RLS (solo admins crean/editan usuarios)
- ✅ 2 usuarios de prueba:
  - **admin** / admin (rol: Admin)
  - **fran** / fran (rol: Comercial)

---

### 2️⃣ **Probar el Login**

1. Ejecuta el proyecto:
   ```powershell
   npm run dev
   ```

2. Abre http://localhost:5174

3. **Prueba con el usuario admin:**
   - Usuario: `admin`
   - Contraseña: `admin`
   - ✅ Deberías ver el dashboard y el menú "Usuarios" (solo visible para Admin)

4. **Prueba con el usuario comercial:**
   - Usuario: `fran`
   - Contraseña: `fran`
   - ✅ Deberías ver el dashboard SIN el menú "Usuarios"

---

### 3️⃣ **Gestión de Usuarios (Solo Admin)**

Cuando inicies sesión como **admin**, verás:

- **Nueva sección en el sidebar:** "Administración > Usuarios"
- **Funciones disponibles:**
  - ✅ Ver todos los usuarios del sistema
  - ✅ Crear nuevos usuarios (botón "Nuevo Usuario")
  - ✅ Activar/Desactivar usuarios (botones en tabla)
  - ✅ Ver último acceso de cada usuario
  - ✅ Asignar roles: Admin, Comercial, Almacén

**Crea usuarios de prueba:**
1. Click en "Nuevo Usuario"
2. Rellena: username, contraseña, nombre, apellidos, rol
3. Los usuarios comerciales NO verán la sección "Usuarios"

---

## 📁 Archivos Modificados

### Backend (SQL)
- ✅ `sql/02_usuarios_sistema.sql` - **NUEVO** Schema completo de usuarios

### Services
- ✅ `src/services/auth.service.ts` - Refactorizado completamente para custom auth

### Types
- ✅ `src/types/index.ts` - Usuario ahora usa `username` (sin email)

### Store
- ✅ `src/store/index.ts` - AuthState usa username/password

### Componentes
- ✅ `src/screens/Login.tsx` - Input de username (no email)
- ✅ `src/screens/Usuarios.tsx` - **NUEVA** Pantalla de gestión de usuarios
- ✅ `src/components/Layout.tsx` - Menú de admin condicional
- ✅ `src/App.tsx` - Ruta `/usuarios` agregada

---

## 🔐 Características de Seguridad

✅ **Contraseñas hasheadas con bcrypt** (pgcrypto)  
✅ **RLS Policies:** Solo admins pueden crear/editar usuarios  
✅ **Funciones RPC seguras:** `SECURITY DEFINER` con validaciones  
✅ **Sesión en sessionStorage:** Persiste al recargar página  
✅ **Control de acceso por rol:** UI condicional según rol  

---

## 🎯 Roles del Sistema

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso completo + gestión de usuarios |
| **Comercial** | Catálogo, Clientes, Pedidos, Facturas |
| **Almacén** | Gestión de stock (pendiente implementar) |

---

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Sistema de autenticación personalizado
- [x] SQL con bcrypt y RPC functions
- [x] Pantalla de gestión de usuarios
- [x] Control de acceso por rol en UI
- [x] Login con username/password
- [x] Usuarios de prueba listos

### ⏳ Pendiente
- [ ] Ejecutar SQL en Supabase (TÚ AHORA)
- [ ] Seed de datos (100 vinos, 10 clientes)
- [ ] Conectar todas las pantallas a Supabase
- [ ] Funcionalidad de cambio de contraseña
- [ ] Subida de imágenes de vinos
- [ ] Generación de PDFs de facturas

---

## 🐛 Troubleshooting

### ❌ "Usuario o contraseña incorrectos"
- Verifica que ejecutaste el SQL `02_usuarios_sistema.sql`
- Comprueba que los usuarios están en la tabla `usuarios` de Supabase

### ❌ "No puedo crear usuarios"
- Verifica que iniciaste sesión con el usuario `admin`
- Solo el rol Admin puede crear usuarios

### ❌ "No veo el menú Usuarios"
- Solo visible para usuarios con rol `Admin`
- Verifica en sessionStorage que tu usuario tiene `rol: "Admin"`

---

## 💡 Siguiente Fase: Seed de Datos

Después de probar el login y crear usuarios, el siguiente paso es:

1. Crear `sql/03_seed_data.sql` con:
   - 100 vinos reales
   - 10 clientes de prueba
   - Algunos pedidos de ejemplo

2. Ejecutar en Supabase SQL Editor

3. Verificar que todas las pantallas muestran datos reales

---

## 📞 Comandos Útiles

```powershell
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

---

**¡Ejecuta el SQL y prueba el login! 🚀**
