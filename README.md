# 🍷 VinIA - Sistema de Gestión Comercial para Distribuidores de Vino

**VinIA** es una aplicación profesional diseñada para comerciales del sector vinícola, inspirada en sistemas ERP como Navision. Funciona perfectamente en **PC, tablets y móviles** como Progressive Web App (PWA).

## 🎯 Características principales

- ✅ **Catálogo de vinos** completo con búsqueda y filtros avanzados
- ✅ **Gestión de clientes** con toda su información comercial
- ✅ **Creación y seguimiento de pedidos** con múltiples estados
- ✅ **Facturación** automatizada desde pedidos
- ✅ **Estadísticas y métricas** de ventas en tiempo real
- ✅ **Diseño responsive** - funciona en todos los dispositivos
- ✅ **Modo offline básico** para trabajar sin conexión
- ✅ **Autenticación** de usuarios con diferentes roles
- 🔜 **Asistente IA** (preparado para futuras versiones)

## 🛠️ Tecnologías utilizadas

### Frontend
- **React 18** - Librería UI moderna y eficiente
- **TypeScript** - Tipado fuerte para mayor robustez
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Navegación entre páginas
- **Zustand** - Gestión de estado ligera y simple
- **Lucide React** - Iconos SVG elegantes

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL como base de datos
  - Autenticación integrada
  - Storage para archivos
  - Real-time subscriptions
  - Row Level Security (RLS)

## 🎨 Diseño

El diseño de VinIA utiliza una **paleta de colores elegante y sobria**, evocando:
- Tonos **tierra y arena** (madera de barrica)
- **Grises cálidos** (profesionalismo)
- **Acentos ámbar y ocre** (elegancia del vino)

**NO** se utilizan colores primarios tradicionales (rojo, azul, verde) para mantener un aspecto único y profesional del sector vinícola.

## 📁 Estructura del proyecto

```
VinIA/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Layout.tsx   # Layout principal con navegación
│   │   ├── VinoCard.tsx # Tarjeta de producto vino
│   │   └── index.ts     # Exportaciones
│   ├── screens/         # Pantallas principales
│   │   ├── Dashboard.tsx    # Métricas y resumen
│   │   ├── Catalogo.tsx     # Catálogo de vinos
│   │   ├── Clientes.tsx     # Gestión de clientes
│   │   ├── Pedidos.tsx      # Gestión de pedidos
│   │   ├── Facturas.tsx     # Facturación
│   │   ├── Login.tsx        # Autenticación
│   │   └── index.ts
│   ├── services/        # Servicios externos
│   │   └── supabase.ts  # Cliente y helpers de Supabase
│   ├── store/           # Estado global (Zustand)
│   │   └── index.ts     # Stores: auth, vinos, clientes, pedidos
│   ├── types/           # Definiciones TypeScript
│   │   └── index.ts     # Interfaces y tipos
│   ├── utils/           # Funciones auxiliares
│   │   └── helpers.ts   # Formateo, validaciones, etc.
│   ├── hooks/           # Custom hooks (preparado)
│   ├── App.tsx          # Componente raíz y router
│   ├── main.tsx         # Punto de entrada
│   └── index.css        # Estilos globales Tailwind
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Instalación y ejecución

### Prerrequisitos
- Node.js 20.19+ o 22.12+ (recomendado)
- npm o yarn

### Instalación

```bash
# Clonar el repositorio (o ya estar en la carpeta)
cd VinIA

# Las dependencias ya están instaladas, pero por si acaso:
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## ⚙️ Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Supabase
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Supabase Setup

Para conectar con Supabase (opcional en modo demo):

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y la clave anónima
4. Crea las tablas necesarias (SQL en `/docs/database.sql` - pendiente)

## 📱 Progressive Web App (PWA)

VinIA está preparado para funcionar como PWA:

1. Se puede **instalar** en cualquier dispositivo
2. Funciona **offline** básico
3. **Notificaciones push** (preparado)
4. **Actualización automática**

## 🔐 Autenticación

El sistema incluye:
- Login con email/contraseña
- Sesiones persistentes
- Rutas protegidas
- Roles de usuario (Admin, Comercial, Visor)

**Modo Demo**: Por ahora acepta cualquier email/contraseña para desarrollo.

## 🧩 Próximas funcionalidades

- [ ] Integración completa con Supabase
- [ ] Modo offline completo con sincronización
- [ ] Generación de PDFs de facturas
- [ ] Exportación a Excel de reportes
- [ ] Gráficos de estadísticas avanzados
- [ ] **Asistente IA** para recomendaciones
- [ ] Notificaciones push
- [ ] Multi-idioma
- [ ] App nativa con Capacitor

## 🤝 Contribuir

Este es un proyecto educativo. Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 👨‍💻 Autor

Desarrollado como proyecto educativo para DAM 2º.

---

**¡Disfruta usando VinIA! 🍷**
