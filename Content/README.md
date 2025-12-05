# VinIA - Gestión de Vinos

VinIA es una aplicación web para la gestión de una distribuidora de vinos, incluyendo gestión de clientes, pedidos, catálogo de vinos y asignaciones comerciales.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

-   **Frontend**: Aplicación React con TypeScript y Vite.
-   **Backend**: Microservicio Spring Boot con Java y H2 Database.

## Requisitos Previos

-   Node.js (v18 o superior)
-   Java JDK 17 o superior
-   Maven

## Instrucciones de Ejecución

### 1. Backend (Spring Boot)

El backend debe ejecutarse primero para que el frontend pueda conectarse.

```bash
cd backend
mvn spring-boot:run
```

El servidor se iniciará en `http://localhost:8080`.
La base de datos H2 está disponible en `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/vinia`, User: `sa`, Password: `password`).

**Usuarios predeterminados:**
-   Admin: `admin` / `admin`
-   Comercial: `comercial` / `comercial`

### 2. Frontend (React)

En una nueva terminal:

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Documentación Adicional

La documentación detallada, arquitectura y funcionalidades se encuentran en la carpeta `docs/`.
