# VinIA

## Descripción del Proyecto

VinIA es una plataforma de gestión comercial especializada, desarrollada para optimizar el flujo de trabajo de los representantes de ventas en la industria vinícola.

El proyecto nació para abordar una carencia específica en el mercado: el software empresarial suele ser potente pero carece de usabilidad para el usuario final en campo. Basándose en una visión directa de los desafíos diarios de los profesionales de ventas, VinIA se centra en la simplicidad, la accesibilidad y la eficiencia. La interfaz está diseñada para minimizar el tiempo administrativo, permitiendo a los agentes comerciales centrarse en las relaciones con los clientes y las ventas, impulsando en última instancia el crecimiento de los ingresos.

Esta herramienta se está desarrollando actualmente con la retroalimentación continua de profesionales activos del sector para garantizar que cumple con los estándares de accesibilidad y las necesidades operativas del mundo real.

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

> El módulo de Inteligencia Artificial descrito en la visión estratégica se encuentra actualmente en fase de arquitectura y desarrollo, por lo que su funcionalidad no está presente en las demostraciones técnicas actuales.

## Visión Estratégica y Hoja de Ruta

Aunque la iteración actual proporciona una base sólida para la gestión comercial, la hoja de ruta del proyecto incluye la integración de un asistente de IA avanzado. Esta funcionalidad está diseñada para actuar como un socio continuo para el representante de ventas, facilitando:

*   **Procesamiento Automatizado de Pedidos**: Agilizando tareas rutinarias.
*   **Recomendaciones Inteligentes**: Proporcionando información basada en datos para clientes específicos.
*   **Soporte a la Decisión**: Mejorando la precisión de las ventas mediante análisis en tiempo real.

**Fecha Objetivo de Finalización:** Junio de 2026.

## Tecnologías Utilizadas

La aplicación utiliza tecnologías estándar en la industria para garantizar que sea rápida, segura y fiable.

*   **Frontend (Interfaz de Usuario)**: Desarrollado con **React** y **TypeScript**. Estas tecnologías permiten crear una experiencia visual moderna y fluida, similar a usar una aplicación móvil nativa, asegurando que funcione perfectamente en tablets y ordenadores.
*   **Backend (Sistema Central)**: Funciona con **Spring Boot (Java)**. Es la tecnología de confianza para grandes empresas, elegida por su capacidad para manejar datos de forma segura y estable, garantizando que el sistema esté siempre disponible.

## Alcance y Enfoque del Desarrollo

El desarrollo de VinIA prioriza la experiencia del **Comercial**. Esta elección estratégica se debe a la posibilidad de validar el software en un entorno real: gracias a la colaboración directa con profesionales del sector (contexto familiar), he podido afinar cada funcionalidad basándome en feedback inmediato y experto. Esto asegura que la aplicación no solo funciona, sino que es intuitiva y resuelve los problemas reales del día a día.

Es importante notar que, aunque la aplicación incluye roles de **Almacén** y **Administración** que son completamente funcionales (permiten gestionar stock, usuarios y cerrar el ciclo de ventas correctamente), su diseño es más utilitario. Estos roles existen principalmente para dar soporte y contexto a las operaciones del comercial, sin profundizar en la complejidad administrativa total que podría tener una gran corporación multinacional. El objetivo ha sido crear un ecosistema completo donde la estrella es la agilidad comercial.

## Inicio Rápido

### Requisitos Previos
*   Node.js 18+
*   Java JDK 17+
*   Maven

### Instalación

1.  **Instalar Dependencias del Frontend**
    ```bash
    cd Content
    npm install
    ```

2.  **Ejecutar la Aplicación**
    Para ejecutar tanto el backend como el frontend simultáneamente:
    ```bash
    npx concurrently --names "BACK,FRONT" --prefix-colors "blue,green" "cd Content/backend && mvn spring-boot:run" "cd Content && npm run dev"
    ```

    *   **URL de la Aplicación**: [http://localhost:5173](http://localhost:5173)
    *   **API del Backend**: [http://localhost:8080](http://localhost:8080)
