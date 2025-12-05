# VinIA Backend

Microservicio Spring Boot para la gestión de VinIA.

## Requisitos

-   Java 17+
-   Maven 3.6+

## Configuración

El archivo `src/main/resources/application.properties` contiene la configuración de la base de datos y el servidor.
Por defecto, utiliza una base de datos H2 en memoria/fichero.

## Ejecución

Para iniciar el servidor:

```bash
mvn spring-boot:run
```

El servidor estará disponible en `http://localhost:8080`.

## API Endpoints

-   `POST /api/auth/login`: Iniciar sesión.
-   `GET /api/vinos`: Listar vinos.
-   `GET /api/clientes`: Listar clientes.
-   `GET /api/pedidos`: Listar pedidos.
-   `POST /api/administracion/asignar`: Asignar cliente a comercial.

## Base de Datos (H2)

Acceso a la consola H2:
-   URL: `http://localhost:8080/h2-console`
-   JDBC URL: `jdbc:h2:file:./data/vinia`
-   User: `sa`
-   Password: `password`
