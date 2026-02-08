# Configuración de IA para VinIA Backend

## ✅ Estado Actual

El backend **ya funciona sin necesidad de configurar la API de IA**. Las funcionalidades de IA están deshabilitadas pero el resto de la aplicación funciona perfectamente.

## 🤖 Funcionalidades de IA (Opcionales)

Si quieres habilitar las funcionalidades de IA del chatbot, necesitas configurar una API key de Google Gemini:

### Funcionalidades que requieren IA:
- **Recomendador de vinos**: Sugerencias personalizadas basadas en historial del cliente
- **Búsqueda semántica**: Búsqueda inteligente de vinos por descripción natural
- **Chatbot integrado**: Asistente conversacional para crear pedidos
- **Customer Insights**: Análisis de comportamiento de clientes

## 📋 Cómo Configurar la API Key (Opcional)

### 1. Obtener la API Key

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key
4. Copia la clave generada

### 2. Configurar la Variable de Entorno

#### En Windows (PowerShell):
```powershell
# Temporal (solo para la sesión actual)
$env:SPRING_AI_GOOGLE_AI_GEMINI_API_KEY="tu-api-key-aqui"

# Permanente (usuario actual)
[System.Environment]::SetEnvironmentVariable('SPRING_AI_GOOGLE_AI_GEMINI_API_KEY', 'tu-api-key-aqui', 'User')
```

#### En Linux/Mac:
```bash
# Temporal
export SPRING_AI_GOOGLE_AI_GEMINI_API_KEY="tu-api-key-aqui"

# Permanente (añadir a ~/.bashrc o ~/.zshrc)
echo 'export SPRING_AI_GOOGLE_AI_GEMINI_API_KEY="tu-api-key-aqui"' >> ~/.bashrc
```

### 3. Reiniciar el Backend

Después de configurar la variable de entorno, reinicia el backend para que tome efecto.

## 🔧 Solución Implementada

Para permitir que el backend arranque sin la API key, se realizaron los siguientes cambios:

1. **`application.properties`**: Se deshabilitó la auto-configuración de Spring AI
   ```properties
   spring.autoconfigure.exclude=org.springframework.ai.autoconfigure.openai.OpenAiAutoConfiguration
   ```

2. **`AIService.java`**: Se añadió validación para verificar si la IA está configurada
   ```java
   private boolean isAiConfigured() {
       return apiKey != null && !apiKey.trim().isEmpty() && 
              baseUrl != null && !baseUrl.trim().isEmpty();
   }
   ```

3. Los métodos de IA retornan respuestas por defecto cuando no está configurada:
   - Recomendaciones: `[]`
   - Búsqueda: `[]`
   - Chat: Mensaje de error amigable

## 📝 Notas

- **Costo**: Google Gemini tiene un tier gratuito generoso
- **Privacidad**: Los datos se envían a Google para procesamiento
- **Rendimiento**: Las funcionalidades sin IA funcionan más rápido
- **Producción**: Para producción, considera usar variables de entorno seguras o servicios de gestión de secretos

## 🚀 Arrancar el Backend

```bash
# Sin IA (funciona siempre)
cd Content/backend
mvn spring-boot:run

# Con IA (requiere API key configurada)
$env:SPRING_AI_GOOGLE_AI_GEMINI_API_KEY="tu-api-key"
mvn spring-boot:run
```

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar la aplicación sin configurar la IA?**  
R: Sí, todas las funcionalidades principales (vinos, clientes, pedidos) funcionan perfectamente sin IA.

**P: ¿Qué pasa si intento usar el chatbot sin API key?**  
R: Recibirás un mensaje indicando que el servicio de IA no está configurado.

**P: ¿Puedo usar otra IA en lugar de Gemini?**  
R: Sí, el código usa la API compatible con OpenAI, por lo que puedes configurar cualquier servicio compatible (OpenAI, Azure OpenAI, etc.) cambiando la URL base y la API key.
