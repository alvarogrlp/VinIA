# VinIA

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/AI-8E75B2?style=for-the-badge" alt="AI" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/JUnit_5-25A162?style=for-the-badge&logo=junit5&logoColor=white" alt="JUnit 5" />
  <img src="https://img.shields.io/badge/Mockito-78C2AD?style=for-the-badge" alt="Mockito" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</div>

## Descripción del Proyecto

VinIA es una plataforma de gestión comercial especializada, desarrollada para optimizar el flujo de trabajo de los representantes de ventas en la industria vinícola.

El proyecto nació para abordar una carencia específica en el mercado: el software empresarial suele ser potente pero carece de usabilidad para el usuario final en campo. Basándose en una visión directa de los desafíos diarios de los profesionales de ventas, VinIA se centra en la simplicidad, la accesibilidad y la eficiencia. La interfaz está diseñada para minimizar el tiempo administrativo, permitiendo a los agentes comerciales centrarse en las relaciones con los clientes y las ventas, impulsando en última instancia el crecimiento de los ingresos.

Esta herramienta se está desarrollando actualmente con la retroalimentación continua de profesionales activos del sector para garantizar que cumple con los estándares de accesibilidad y las necesidades operativas del mundo real.

> **📱 Mobile First:** La aplicación ha sido diseñada priorizando la experiencia móvil. Es completamente funcional en smartphones y tablets, permitiendo a los comerciales operar con total libertad desde cualquier lugar.

## Demostraciones del Proyecto

<div align="center">
  <table style="border-collapse: collapse; border: none;">
    <tr>
      <td align="center" style="padding: 20px; border: none;">
        <p><strong>Demo 1: Bases y Flujo Inicial</strong><br/><em>13 de Enero, 2026</em></p>
        <a href="https://www.youtube.com/watch?v=chMul1mp6QY">
          <img src="Resources/Images/Logo.png" width="180" alt="Demo 1"/>
        </a>
      </td>
      <td align="center" style="padding: 20px; border: none;">
        <p><strong>Demo 2: Funciones Finales y Refactorización</strong><br/><em>17 de Enero, 2026</em></p>
        <a href="https://youtu.be/Bdzbu3fK1-I">
          <img src="Resources/Images/Logo.png" width="180" alt="Demo 2"/>
        </a>
      </td>
    </tr>
  </table>
  <p><em>Haz clic en los logos para ver las demostraciones en YouTube</em></p>
</div>

> **Estado Actual:** El módulo de Inteligencia Artificial ya cuenta con **múltiples funcionalidades operativas** (análisis de clientes, recomendaciones, chat interactivo), aunque el proyecto sigue en desarrollo activo para refinar y ampliar estas capacidades. **En los videos aun no se muestran las funcionalidades de la IA**

## Visión Estratégica y Hoja de Ruta

Aunque la iteración actual proporciona una base sólida para la gestión comercial, la hoja de ruta del proyecto incluye la integración de un asistente de IA avanzado. Esta funcionalidad está diseñada para actuar como un socio continuo para el representante de ventas, facilitando:

*   **Procesamiento Automatizado de Pedidos**: Agilizando tareas rutinarias.
*   **Recomendaciones Inteligentes**: Proporcionando información basada en datos para clientes específicos.
*   **Soporte a la Decisión**: Mejorando la precisión de las ventas mediante análisis en tiempo real.

**Fecha Objetivo de Finalización:** Junio de 2026.

## Tecnologías Usadas

El proyecto utiliza un stack moderno y robusto para garantizar rendimiento, escalabilidad y una excelente experiencia de usuario.

### Frontend
*   **React 18**: Biblioteca principal para la construcción de la interfaz.
*   **TypeScript**: Superset de JavaScript que añade tipado estático y seguridad.
*   **Vite**: Herramienta de construcción y servidor de desarrollo de última generación.
*   **TailwindCSS**: Framework de utilidades para un diseño rápido y responsivo.
*   **Zustand**: Gestión de estado ligera y flexible.
*   **Lucide React**: Conjunto de iconos vectoriales limpios y consistentes.
*   **Recharts**: Librería de gráficos composables para visualización de datos.

### Backend
*   **Java 17 & Spring Boot 3**: Framework empresarial para el desarrollo de microservicios.
*   **Spring AI**: Capa de abstracción para integrar modelos de IA (Gemini/OpenAI).
*   **H2 Database**: Base de datos SQL embebida de alto rendimiento.
*   **Maven**: Herramienta de gestión de proyectos y dependencias.
*   **JUnit 5, Mockito & Spring Security Test**: Testing profesional unitario, de integración y seguridad.

### Despliegue y Contenedores
*   **Docker & Docker Compose**: Contenedorización para un despliegue sencillo, rápido y profesional.
*   **Nginx**: Servidor web de alto rendimiento y proxy inverso.

## Alcance y Enfoque del Desarrollo

El desarrollo de VinIA prioriza la experiencia del **Comercial**. Esta elección estratégica se debe a la posibilidad de validar el software en un entorno real: gracias a la colaboración directa con profesionales del sector (contexto familiar), he podido afinar cada funcionalidad basándome en feedback inmediato y experto. Esto asegura que la aplicación no solo funciona, sino que es intuitiva y resuelve los problemas reales del día a día.

Es importante notar que, aunque la aplicación incluye roles de **Almacén** y **Administración** que son completamente funcionales (permiten gestionar stock, usuarios y cerrar el ciclo de ventas correctamente), su diseño es más utilitario. Estos roles existen principalmente para dar soporte y contexto a las operaciones del comercial, sin profundizar en la complejidad administrativa total que podría tener una gran corporación multinacional. El objetivo ha sido crear un ecosistema completo donde la estrella es la agilidad comercial.

## Cómo probar la aplicación (Modo Fácil)

Si no tienes conocimientos técnicos avanzados, esta es la forma más sencilla de ver VinIA funcionando en tu ordenador.

### Paso 0: Requisitos Previos

Solo necesitas tener instalado un programa: **Docker Desktop**.
*   Es la herramienta que permite ejecutar la aplicación en un contenedor aislado sin configurar nada más.
*   Puedes descargarlo gratis aquí: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
*   Instálalo y asegúrate de que esté abierto (verás un icono de una ballena en tu barra de tareas).

### Paso 1: Configurar la IA (Opcional)
Si quieres probar el chat inteligente y las recomendaciones, necesitas una "llave" gratuita de Google:

1.  **Conseguirla (1 minuto)**:
    *   Entra en [Google AI Studio](https://aistudio.google.com/) e inicia sesión con tu cuenta de Google.
    *   Pulsa en el botón azul que dice **"Get API key"** (suele estar arriba a la izquierda).
    *   Haz clic en **"Create API key"**.
    *   Si te pregunta, elige la opción de **"Create API key in new project"**.
    *   Se generará un código largo que empieza por `AIza...`. **Cópialo**.

2.  **Ponerla en la App**:
    *   Ve a la carpeta `Content/backend/src/main/resources/`.
    *   Haz clic derecho en el archivo `application.properties` -> Abrir con -> **Bloc de notas**.
    *   Busca el texto `TU_CLAVE_COPIADA_AQUI` y bórralo.
    *   Pega ahí la clave que acabas de copiar.
    *   Guarda y cierra el archivo.

*(Si te saltas este paso, la app funcionará igual, pero no tendrás las funciones de la IA).*

### Paso 2: ¡Arrancar!

1.  Busca el archivo de inicio según tu ordenador:
    *   **Si usas Windows**: Busca el archivo `start-vinia.bat` y haz **doble clic** sobre él.
    *   **Si usas Mac o Linux**: Abre una terminal en esta carpeta y escribe `./start-vinia.sh` (o arrastra el archivo a la terminal y pulsa Enter).
2.  Se abrirá una ventana que empezará a preparar todo automáticamente.
    *   *Paciencia: La primera vez puede tardar unos 5-10 minutos mientras se descarga "el motor" de la app.*
3.  Cuando veas que termina de cargar, abre tu navegador y visita: **[http://localhost:3000](http://localhost:3000)**

¡Listo! Ya puedes iniciar sesión con las credenciales de prueba.

### Credenciales de Acceso (Usuario / Contraseña)

| Rol | Usuario | Contraseña | ¿Qué puedes hacer? |
| :--- | :--- | :--- | :--- |
| **Comercial** | `carlos` | `1234` | Ver catálogo, hacer pedidos, probar el Chatbot IA. |
| **Almacén** | `almacen` | `almacen` | Gestionar stock de vinos. |
| **Admin** | `admin` | `admin` | Ver estadísticas globales y gestionar usuarios. |

---

## Para Desarrolladores (Modo Avanzado)

Si eres programador y quieres modificar el código, aquí tienes los pasos para la ejecución manual sin Docker.

### Requisitos Técnicos
*   Node.js 18+
*   Java JDK 17+
*   Maven

### Ejecución Manual en Entorno de Desarrollo

1.  **Instalar Dependencias del Frontend**
    ```bash
    cd Content
    npm install
    ```

2.  **Ejecutar la Aplicación**
    Usa el comando correspondiente a tu sistema operativo. Esto lanzará tanto el Backend (puerto 8080) como el Frontend (puerto 5173) con recarga en caliente (hot-reload).

    **Windows (PowerShell):**
    ```powershell
    npx concurrently --names "BACK,FRONT" --prefix-colors "blue,green" "cd Content\backend && mvn spring-boot:run" "cd Content && npm run dev"
    ```

    **Mac / Linux:**
    ```bash
    npx concurrently --names "BACK,FRONT" --prefix-colors "blue,green" "cd Content/backend && mvn spring-boot:run" "cd Content && npm run dev"
    ```

    *   **Acceso Dev**: Abre [http://localhost:5173](http://localhost:5173)

---

## 🌐 Túnel con ngrok (Acceso Remoto)

En esta rama, la aplicación está configurada para conectarse al backend a través de una URL profesional de ngrok. Para levantar el túnel rápidamente, utiliza este comando:

```bash
ngrok http --url=unparenthetically-distraught-jan.ngrok-free.dev 8080
```

> **Nota**: Asegúrate de tener el backend corriendo en el puerto 8080 antes de iniciar el túnel.


