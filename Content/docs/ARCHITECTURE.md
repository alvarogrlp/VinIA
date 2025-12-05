# 🏗️ Arquitectura del Proyecto VinIA

## 📐 Visión General

VinIA está construido como una **Progressive Web App (PWA)** utilizando una arquitectura moderna de frontend con React y TypeScript, siguiendo patrones de diseño escalables y mantenibles.

## 🎯 Principios de Diseño

### 1. **Separación de Responsabilidades**
- **Componentes**: UI pura y reutilizable
- **Screens**: Pantallas completas con lógica de negocio
- **Store**: Estado global de la aplicación
- **Services**: Comunicación con APIs externas
- **Utils**: Funciones auxiliares puras

### 2. **Composition over Inheritance**
- Uso de componentes funcionales
- Custom hooks para lógica reutilizable
- Props drilling mínimo gracias a Zustand

### 3. **Type Safety First**
- TypeScript en todo el proyecto
- Interfaces bien definidas en `/types`
- Validación en tiempo de compilación

## 📂 Arquitectura de Carpetas

```
src/
│
├── components/          # Componentes UI reutilizables
│   ├── Layout.tsx      # Wrapper principal con navegación
│   ├── VinoCard.tsx    # Tarjeta de producto
│   └── index.ts        # Barrel exports
│
├── screens/            # Pantallas completas (Pages)
│   ├── Dashboard.tsx   # Vista principal con métricas
│   ├── Catalogo.tsx    # Listado de vinos
│   ├── Clientes.tsx    # Gestión de clientes
│   ├── Pedidos.tsx     # Gestión de pedidos
│   ├── Facturas.tsx    # Facturación
│   ├── Login.tsx       # Autenticación
│   └── index.ts        # Barrel exports
│
├── store/              # Estado global (Zustand)
│   └── index.ts        # Todos los stores
│       ├── useAuthStore        # Autenticación
│       ├── useVinosStore       # Catálogo de vinos
│       ├── useClientesStore    # Clientes
│       └── usePedidosStore     # Pedidos
│
├── services/           # Servicios externos
│   └── supabase.ts     # Cliente de Supabase + helpers
│
├── types/              # Definiciones TypeScript
│   └── index.ts        # Todas las interfaces
│
├── utils/              # Funciones helper
│   └── helpers.ts      # Formateo, validaciones, etc.
│
├── hooks/              # Custom hooks (preparado)
│   └── useDebounce.ts  # (ejemplo futuro)
│
├── App.tsx             # Router y rutas protegidas
├── main.tsx            # Entry point
└── index.css           # Estilos globales + Tailwind
```

## 🔄 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ Interacción
       ▼
┌─────────────────────┐
│   UI Components     │ ◄─── React Components
│   (screens/)        │      (Presentación)
└──────┬──────────────┘
       │ dispatch/select
       ▼
┌─────────────────────┐
│   Zustand Store     │ ◄─── Estado Global
│   (store/)          │      (Business Logic)
└──────┬──────────────┘
       │ async actions
       ▼
┌─────────────────────┐
│   Services          │ ◄─── API Calls
│   (services/)       │      (Data Layer)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Supabase          │ ◄─── Backend
│   (PostgreSQL)      │      (Database + Auth)
└─────────────────────┘
```

## 🎨 Patrón de Componentes

### Componentes Atómicos
- **Botones**: `btn-primary`, `btn-secondary`, `btn-outline`
- **Inputs**: `input` con estilos personalizados
- **Badges**: `badge-success`, `badge-warning`, etc.
- **Cards**: `card` base elegante

### Componentes Compuestos
- **Layout**: Sidebar + Content Area
- **VinoCard**: Card especializada para productos
- **Tables**: Tablas con estilo `.table`

### Screens (Pages)
- Orquestan componentes
- Gestionan estado local si necesario
- Conectan con stores de Zustand

## 🗄️ Gestión de Estado

### Zustand Stores

**¿Por qué Zustand?**
- Más simple que Redux
- Sin boilerplate
- TypeScript-first
- Performance óptimo
- Middleware de persistencia incluido

**Estructura de un Store:**

```typescript
interface StoreState {
  // Estado
  data: Item[];
  loading: boolean;
  
  // Acciones
  loadData: () => Promise<void>;
  updateItem: (id: string, data: Partial<Item>) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  data: [],
  loading: false,
  
  loadData: async () => {
    set({ loading: true });
    const data = await fetchData();
    set({ data, loading: false });
  },
  
  updateItem: (id, data) => {
    set(state => ({
      data: state.data.map(item => 
        item.id === id ? { ...item, ...data } : item
      )
    }));
  },
}));
```

## 🔐 Autenticación

### Flujo de Auth

```
Login → Supabase Auth → JWT Token → Zustand Store → LocalStorage
                                           ↓
                                    Protected Routes
                                           ↓
                                    Authorized Access
```

### Rutas Protegidas

```typescript
<ProtectedRoute>
  <Layout>
    <Dashboard />
  </Layout>
</ProtectedRoute>
```

## 🎨 Sistema de Estilos

### Tailwind CSS + Clases Personalizadas

**Ventajas:**
- Utility-first approach
- Tree-shaking automático
- No CSS-in-JS runtime
- Fácil personalización

**Estructura:**

```css
@layer base {
  /* Estilos base HTML */
}

@layer components {
  /* Componentes reutilizables */
  .btn-primary { ... }
  .card { ... }
}

@layer utilities {
  /* Utilidades custom */
  .scrollbar-hide { ... }
}
```

## 🚀 Optimizaciones

### Performance

1. **Code Splitting**
   - React.lazy() para rutas (pendiente)
   - Dynamic imports para módulos pesados

2. **Memoization**
   - React.memo para componentes pesados
   - useMemo para cálculos costosos
   - useCallback para funciones

3. **Virtual Scrolling**
   - Para listas largas (pendiente)
   - react-window o react-virtualized

### Bundle Size

- Tree-shaking automático con Vite
- Tailwind purge en producción
- Lazy loading de rutas
- Optimización de imágenes

## 🔌 Integraciones

### Supabase

**Servicios utilizados:**
- **Auth**: Autenticación de usuarios
- **Database**: PostgreSQL con RLS
- **Storage**: Para imágenes de vinos (futuro)
- **Realtime**: Actualizaciones en tiempo real (futuro)

### PWA

**Características:**
- Service Worker para cache
- Manifest.json para instalación
- Offline-first approach
- Push notifications (futuro)

## 🧪 Testing (Futuro)

### Stack sugerido:
- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing

### Estructura de tests:
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
```

## 📊 Monitoreo (Futuro)

### Herramientas sugeridas:
- **Sentry**: Error tracking
- **Google Analytics**: Analytics
- **Vercel Analytics**: Performance
- **LogRocket**: Session replay

## 🔄 CI/CD (Futuro)

### Pipeline sugerido:
```
Push → GitHub Actions → Lint + Test → Build → Deploy → Vercel
```

## 📈 Escalabilidad

### Preparado para:
- Multi-tenancy (múltiples empresas)
- Microservicios (separar backend)
- Internacionalización (i18n)
- Módulos adicionales
- Integraciones externas
- IA Assistant

## 🎯 Próximos Pasos de Arquitectura

1. **Implementar Custom Hooks**
   - useDebounce
   - usePagination
   - useInfiniteScroll

2. **Context API para temas**
   - Dark mode
   - Preferencias de usuario

3. **Error Boundaries**
   - Captura de errores global
   - UI de fallback

4. **Optimización de imágenes**
   - Lazy loading
   - WebP format
   - CDN

5. **Service Worker avanzado**
   - Cache strategies
   - Background sync
   - Push notifications

---

**Esta arquitectura está diseñada para crecer con el proyecto**, manteniendo la simplicidad en las fases tempranas pero con estructura para escalar cuando sea necesario.
