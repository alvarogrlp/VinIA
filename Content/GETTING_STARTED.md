# 🚀 Guía de Inicio Rápido - VinIA

## Primeros pasos

### 1. Verificar versión de Node.js

VinIA requiere Node.js versión 20.19+ o 22.12+. Tu versión actual es **18.16.1**.

**⚠️ IMPORTANTE**: Necesitas actualizar Node.js para ejecutar el proyecto correctamente.

#### Actualizar Node.js:

**Opción 1 - Descargar directamente:**
- Visita: https://nodejs.org/
- Descarga la versión LTS (recomendada)
- Instala y reinicia tu terminal

**Opción 2 - Con nvm (Node Version Manager):**
```bash
# Si tienes nvm instalado
nvm install 20
nvm use 20
```

### 2. Instalar dependencias (después de actualizar Node)

```bash
cd "c:\Users\alvar\Desktop\Programacion\DAM 2º\VinIA"
npm install
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación se abrirá en: http://localhost:5173

### 4. Acceder a la aplicación

**Modo Demo (actual)**:
- Email: cualquier email válido
- Contraseña: cualquier texto
- Haz clic en "Iniciar sesión"

## 📋 Funcionalidades disponibles

### ✅ Ya implementado:
- ✅ Sistema de autenticación (modo demo)
- ✅ Dashboard con métricas
- ✅ Catálogo de vinos con búsqueda
- ✅ Gestión de clientes
- ✅ Listado de pedidos
- ✅ Listado de facturas
- ✅ Navegación responsive (móvil/tablet/desktop)
- ✅ Diseño elegante con paleta de colores personalizada
- ✅ Store con Zustand para gestión de estado
- ✅ Rutas protegidas
- ✅ Layout profesional con sidebar

### 🔄 Pendiente de implementar:
- Conexión real con Supabase
- Creación/edición de vinos
- Creación/edición de clientes
- Flujo completo de pedidos
- Generación de facturas PDF
- Estadísticas con gráficos
- Modo offline real
- Asistente IA

## 🎨 Personalización

### Colores del tema

Los colores están definidos en `tailwind.config.js`:

- **Primary** (dorado arena): Para botones principales, elementos destacados
- **Secondary** (grises cálidos): Para textos y elementos secundarios
- **Accent** (ámbar suave): Para acentos y detalles

### Modificar estilos

Los estilos globales están en `src/index.css`:
- Clases de utilidad personalizadas: `.btn-primary`, `.card`, `.input`, etc.
- Modificable sin tocar los componentes

## 🔧 Estructura de datos

### Tipos principales (ver `src/types/index.ts`)

```typescript
// Vino
interface Vino {
  id: string;
  nombre: string;
  bodega: string;
  tipo: 'Tinto' | 'Blanco' | 'Rosado' | 'Espumoso' | ...;
  ano: number;
  precio: number;
  stock: number;
  // ... más campos
}

// Cliente
interface Cliente {
  id: string;
  nombre: string;
  cif: string;
  tipo: 'Restaurante' | 'Hotel' | 'Tienda' | ...;
  // ... más campos
}

// Pedido
interface Pedido {
  id: string;
  numero: string;
  clienteId: string;
  estado: 'Borrador' | 'Pendiente' | 'Confirmado' | ...;
  lineas: LineaPedido[];
  total: number;
  // ... más campos
}
```

## 📦 Comandos útiles

```bash
# Modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar producción
npm run preview

# Linter
npm run lint

# Verificar errores TypeScript
npx tsc --noEmit
```

## 🐛 Solución de problemas comunes

### Error: "Node.js version required"
- Actualiza Node.js a la versión 20+

### Error: "Module not found"
- Ejecuta `npm install` de nuevo

### Error: "@tailwind" unknown at rule
- Es normal, se resuelve al ejecutar el proyecto
- Los estilos funcionarán correctamente

### La aplicación no carga en el navegador
- Verifica que el puerto 5173 esté libre
- Revisa la consola del navegador (F12)

## 🔐 Configurar Supabase (opcional)

1. Crea cuenta en https://supabase.com
2. Crea un nuevo proyecto
3. Ve a Settings > API
4. Copia tu Project URL y anon/public key
5. Crea archivo `.env` basado en `.env.example`
6. Pega tus credenciales
7. Reinicia el servidor dev

## 📚 Recursos adicionales

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Supabase Docs](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)

## 💡 Siguientes pasos recomendados

1. **Actualizar Node.js** (obligatorio)
2. Familiarizarte con la estructura del proyecto
3. Probar las pantallas disponibles
4. Revisar el código de los componentes
5. Configurar Supabase (opcional, para base de datos real)
6. Empezar a implementar las funcionalidades pendientes
7. Personalizar colores y estilos según preferencias

---

**¿Necesitas ayuda?** Revisa el código fuente, está bien comentado 😊
