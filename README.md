# 🍷 VinIA - Sistema de Gestión Comercial para Distribuidores de Vino

**VinIA** es una aplicación profesional diseñada para comerciales del sector vinícola, inspirada en sistemas ERP como Navision. Funciona perfectamente en **PC, tablets y móviles** como Progressive Web App (PWA).

> 🚧 **Estado del Proyecto**: Esta aplicación se encuentra actualmente en una fase temprana de desarrollo.

## 🤖 Visión: Inteligencia Artificial para Comerciales

El núcleo de la evolución futura de VinIA es la integración de un **Asistente IA** avanzado. Esta herramienta está siendo diseñada para actuar como un copiloto inteligente que potenciará la eficiencia de los comerciales mediante:

- **Recomendaciones Inteligentes**: Sugerencias de vinos personalizadas basadas en el perfil del cliente y tendencias.
- **Gestión Asistida de Pedidos**: Creación y procesamiento de pedidos mediante comandos de lenguaje natural.
- **Atención al Cliente Aumentada**: Soporte instantáneo para resolver dudas sobre el catálogo y maridajes.

## 🎯 Características principales

- ✅ **Catálogo de vinos** completo con búsqueda y filtros avanzados
- ✅ **Gestión de clientes** con toda su información comercial
- ✅ **Creación y seguimiento de pedidos** con múltiples estados
- ✅ **Facturación** automatizada desde pedidos
- ✅ **Estadísticas y métricas** de ventas en tiempo real
- ✅ **Diseño responsive** - funciona en todos los dispositivos
- ✅ **Autenticación** de usuarios con diferentes roles (Admin, Comercial)

## 🛠️ Tecnologías utilizadas

### Frontend
- **React 18** - Librería UI moderna y eficiente
- **TypeScript** - Tipado fuerte para mayor robustez
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Framework CSS utility-first
- **Zustand** - Gestión de estado ligera y simple

### Backend
- **Spring Boot 3** - Framework Java robusto para microservicios
- **Spring Data JPA** - Persistencia de datos
- **H2 Database** - Base de datos en memoria (fácil despliegue y pruebas)
- **Spring Security** - Gestión de autenticación y autorización

## ⚡ Inicio Rápido (One-Click)

**Paso 1: Instalación (Solo la primera vez)**
Antes de iniciar, asegúrate de instalar las dependencias del frontend:

```bash
cd Content
npm install
cd ..
```

**Paso 2: Ejecución**
Para arrancar todo el sistema automáticamente (Backend + Frontend) en la **misma terminal**, ejecuta el siguiente comando:

```bash
npx concurrently --names "BACK,FRONT" --prefix-colors "blue,green" "cd Content/backend && mvn spring-boot:run" "cd Content && npm run dev"
```

> ℹ️ **NOTA**: Verás los logs del Backend (azul) y del Frontend (verde) mezclados en la misma ventana. Para detener todo, presiona `Ctrl + C` dos veces.
>
> La aplicación se abrirá en: [http://localhost:5173](http://localhost:5173)

## 📁 Estructura del proyecto

El código fuente se encuentra en la carpeta `Content/`.

```
VinIA/
├── Content/
│   ├── backend/         # Microservicio Spring Boot
│   ├── src/             # Frontend React
│   ├── docs/            # Documentación detallada
│   └── ...
└── README.md
```

## 🚀 Instalación y ejecución

### Prerrequisitos
- Node.js 18+
- Java JDK 17+
- Maven

### 1. Iniciar Backend (Spring Boot)

```bash
cd Content/backend
mvn spring-boot:run
```

- Servidor: `http://localhost:8080`
- Consola H2: `http://localhost:8080/h2-console`
- **Usuarios**: `admin`/`admin` y `comercial`/`comercial`

### 2. Iniciar Frontend (React)

En una nueva terminal:

```bash
cd Content
npm install
npm run dev
```

- Aplicación: `http://localhost:5173`

## 📚 Documentación

La documentación detallada del proyecto se encuentra en `Content/docs/`.
