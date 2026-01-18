package com.vinia.backend.service;

import com.vinia.backend.model.Cliente;
import com.vinia.backend.model.Pedido;
import com.vinia.backend.model.Vino;
import com.vinia.backend.repository.ClienteRepository;
import com.vinia.backend.repository.PedidoRepository;
import com.vinia.backend.repository.VinoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIService {

        private final ClienteRepository clienteRepository;
        private final PedidoRepository pedidoRepository;
        private final VinoRepository vinoRepository;
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Value("${spring.ai.openai.api-key}")
        private String apiKey;

        @Value("${spring.ai.openai.base-url}")
        private String baseUrl;

        @Value("${spring.ai.openai.chat.options.model}")
        private String modelName;

        // Cache del catálogo para evitar consultas repetidas
        private String catalogoCache = null;
        private long catalogoCacheTime = 0;
        private static final long CACHE_DURATION_MS = 300000; // 5 minutos

        // Método para obtener el catálogo (con caché, limitado a 30 vinos)
        private String getCatalogoResumen() {
                long now = System.currentTimeMillis();
                if (catalogoCache == null || (now - catalogoCacheTime) > CACHE_DURATION_MS) {
                        List<Vino> catalogo = vinoRepository.findAll();
                        catalogoCache = catalogo.stream()
                                        .limit(30) // Limitar a 30 vinos para reducir tamaño del prompt
                                        .map(v -> String.format("- %s (ID: %s, %s, %.2f€)",
                                                        v.getNombre(), v.getId(), v.getTipo(), v.getPrecio()))
                                        .collect(Collectors.joining("\n"));
                        catalogoCacheTime = now;
                }
                return catalogoCache;
        }

        // 1. Recomendador con Sales Pitch (Optimizado)
        public String getRecommendations(String clienteId) {
                Cliente cliente = clienteRepository.findById(clienteId)
                                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

                // Solo cargar últimos 10 pedidos para el historial
                List<Pedido> pedidos = pedidoRepository.findByClienteIdOrderByFechaDesc(clienteId);

                String historial = pedidos.stream()
                                .flatMap(p -> p.getLineas().stream())
                                .map(l -> l.getVino().getNombre())
                                .distinct()
                                .limit(10)
                                .collect(Collectors.joining(", "));

                if (historial.isEmpty())
                        historial = "Sin historial reciente.";

                String catalogoResumen = getCatalogoResumen();

                String prompt = """
                                Rol: Sumiller experto.

                                CLIENTE: %s (%s). Zona: %s.
                                HISTORIAL: %s
                                NOTAS: %s

                                CATÁLOGO:
                                %s

                                TAREA: Recomienda 3 vinos estratégicos con un argumento de venta breve (máx 2 frases).

                                SALIDA JSON:
                                [
                                  {
                                    "vinoId": "ID del vino",
                                    "nombre": "Nombre exacto",
                                    "salesPitch": "Argumento breve..."
                                  }
                                ]
                                """
                                .formatted(
                                                cliente.getNombre(),
                                                cliente.getTipo() != null ? cliente.getTipo() : "",
                                                cliente.getZona() != null ? cliente.getZona() : "",
                                                historial,
                                                cliente.getNotas() != null ? cliente.getNotas() : "",
                                                catalogoResumen);

                try {
                        return callAi(prompt);
                } catch (Exception e) {
                        return "[]";
                }
        }

        // 2. Voz a Pedido (Optimizado)
        public String parseOrderFromText(String text) {
                String catalogoSimple = getCatalogoResumen();

                String prompt = """
                                Rol: Asistente logístico.

                                CATÁLOGO:
                                %s

                                PEDIDO: "%s"

                                TAREA: Identifica vinos y cantidades. Si no hay cantidad, asume 1.

                                SALIDA JSON:
                                {
                                  "items": [
                                    {
                                      "vinoId": "ID exacto del catálogo",
                                      "nombreDetectado": "Nombre",
                                      "cantidad": 12
                                    }
                                  ]
                                }
                                """
                                .formatted(catalogoSimple, text);

                try {
                        return callAi(prompt);
                } catch (Exception e) {
                        return "{\"items\": []}";
                }
        }

        // 3. Customer Insights (Optimizado)
        public String analyzeCustomerInsights(String clienteId) {
                Cliente cliente = clienteRepository.findById(clienteId)
                                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

                // Solo últimos 3 pedidos
                List<Pedido> pedidos = pedidoRepository.findByClienteIdOrderByFechaDesc(clienteId);

                String historialNotas = pedidos.stream()
                                .limit(3)
                                .map(p -> p.getNotas())
                                .filter(n -> n != null && !n.isEmpty())
                                .collect(Collectors.joining("; "));

                String prompt = """
                                Analiza este cliente y dame insights estratégicos (máx 2 líneas).
                                Cliente: %s. Tipo: %s. Zona: %s.
                                Notas: %s
                                Últimas visitas: %s

                                Detecta riesgos u oportunidades.
                                """.formatted(
                                cliente.getNombre(),
                                cliente.getTipo() != null ? cliente.getTipo() : "",
                                cliente.getZona() != null ? cliente.getZona() : "",
                                cliente.getNotas() != null ? cliente.getNotas() : "",
                                historialNotas.isEmpty() ? "Sin notas" : historialNotas);

                try {
                        return callAi(prompt);
                } catch (Exception e) {
                        return "Analizando datos...";
                }
        }

        // 4. Búsqueda Semántica (Optimizado)
        public String semanticSearch(String query) {
                String catalogoDetallado = getCatalogoResumen();

                String prompt = """
                                Busca en el catálogo los 3 mejores vinos para: "%s"

                                CATÁLOGO:
                                %s

                                SALIDA JSON:
                                [
                                  {
                                    "vinoId": "...",
                                    "nombre": "...",
                                    "razon": "Por qué encaja"
                                  }
                                ]
                                """
                                .formatted(query, catalogoDetallado);

                try {
                        return callAi(prompt);
                } catch (Exception e) {
                        return "[]";
                }
        }

        // 5. Chat Integrado (Orquestador) - Optimizado
        public String chat(String message, String contextJson) {
                try {
                        // Paso 1: IA extrae la intención
                        String intentPrompt = String.format("""
                                        Actúa como procesador de pedidos.
                                        Input: "%s"

                                        Reglas:
                                        1. Identifica CLIENTE
                                        2. Identifica productos y cantidades
                                        3. Si producto incompleto, infiere bodega del anterior

                                        JSON:
                                        {
                                          "tipo": "PEDIDO" | "RECOMENDACION" | "CONSULTA",
                                          "busqueda_cliente": "nombre o null",
                                          "items": [{"busqueda_vino": "nombre", "cantidad": 1}]
                                        }
                                        """, message);
                        String intentResponse = callAi(intentPrompt);
                        System.out.println("Intent: " + intentResponse);

                        JsonNode intent = objectMapper.readTree(intentResponse);
                        String tipo = intent.path("tipo").asText("CONSULTA");

                        if ("PEDIDO".equals(tipo)) {
                                return procesarPedido(intent, contextJson);
                        } else if ("RECOMENDACION".equals(tipo)) {
                                return procesarRecomendacion(message);
                        } else {
                                return "{\"reply\": \"¿En qué puedo ayudarte?\", \"action\": \"NONE\"}";
                        }

                } catch (Exception e) {
                        System.err.println("Chat Error: " + e.getMessage());
                        e.printStackTrace();
                        return "{\"reply\": \"Lo siento, hubo un error.\", \"action\": \"NONE\"}";
                }
        }

        // Método para invalidar la caché (llamar cuando se actualice el catálogo)
        public void invalidateCache() {
                catalogoCache = null;
                catalogoCacheTime = 0;
        }

        // Helper method (Direct REST Call)
        private String callAi(String prompt) throws Exception {
                try {
                        // Ensure the URI is correct for Gemini OpenAI compatibility
                        String uri = baseUrl;
                        if (!uri.endsWith("/chat/completions")) {
                                if (!uri.endsWith("/"))
                                        uri += "/";
                                uri += "chat/completions";
                        }

                        // OpenAI JSON Body structure
                        Map<String, Object> message = Map.of("role", "user", "content", prompt);
                        Map<String, Object> requestBody = Map.of(
                                        "model", modelName,
                                        "messages", List.of(message),
                                        "temperature", 0.7);

                        RestClient restClient = RestClient.create();

                        String responseBody = restClient.post()
                                        .uri(uri)
                                        .header("Authorization", "Bearer " + apiKey)
                                        .header("Content-Type", "application/json")
                                        .body(requestBody)
                                        .retrieve()
                                        .body(String.class);

                        System.out.println("AI Response Body: " + responseBody);

                        // Parse response: choices[0].message.content
                        JsonNode root = objectMapper.readTree(responseBody);
                        JsonNode choices = root.path("choices");
                        if (choices.isArray() && choices.size() > 0) {
                                String content = choices.get(0).path("message").path("content").asText();

                                // Clean Markdown
                                if (content.contains("```json")) {
                                        content = content.replace("```json", "").replace("```", "");
                                }

                                String trimmed = content.trim();
                                System.out.println("AI Parsed Content: " + trimmed);

                                if (trimmed.isEmpty()) {
                                        System.err.println("WARNING: AI returned empty content");
                                        throw new RuntimeException("Empty AI response");
                                }

                                return trimmed;
                        }

                        throw new RuntimeException("No choices returned from AI");

                } catch (Exception e) {
                        System.err.println("AI Error Details: " + e.getMessage());
                        e.printStackTrace();
                        if (e instanceof org.springframework.web.client.HttpClientErrorException) {
                                org.springframework.web.client.HttpClientErrorException he = (org.springframework.web.client.HttpClientErrorException) e;
                                System.err.println("Response Body: " + he.getResponseBodyAsString());
                        }
                        throw e;
                }
        }

        // Procesar pedido usando búsqueda en BD
        private String procesarPedido(JsonNode intent, String contextJson) throws Exception {
                String busquedaCliente = intent.path("busqueda_cliente").asText("");
                JsonNode itemsNode = intent.path("items");

                // Buscar cliente
                String clienteId = null;
                String clienteNombre = "";

                if (!busquedaCliente.isEmpty()) {
                        List<Cliente> clientes = clienteRepository.findAll();
                        for (Cliente c : clientes) {
                                if (c.getNombre().toLowerCase().contains(busquedaCliente.toLowerCase())) {
                                        clienteId = c.getId();
                                        clienteNombre = c.getNombre();
                                        break;
                                }
                        }
                }

                // Si no encontró cliente, intentar desde contexto
                if (clienteId == null) {
                        try {
                                JsonNode context = objectMapper.readTree(contextJson);
                                clienteId = context.path("clienteId").asText("");
                                if (!clienteId.isEmpty()) {
                                        Cliente c = clienteRepository.findById(clienteId).orElse(null);
                                        if (c != null)
                                                clienteNombre = c.getNombre();
                                }
                        } catch (Exception e) {
                        }
                }

                if (clienteId == null || clienteId.isEmpty()) {
                        return "{\"reply\": \"No pude identificar el cliente. ¿Podrías especificar el nombre del cliente?\", \"action\": \"NONE\"}";
                }

                // Buscar vinos
                List<Vino> todosVinos = vinoRepository.findAll();
                List<Map<String, Object>> itemsEncontrados = new ArrayList<>();

                if (itemsNode.isArray()) {
                        for (JsonNode item : itemsNode) {
                                String busquedaVino = item.path("busqueda_vino").asText("");
                                int cantidad = item.path("cantidad").asInt(1);

                                // Búsqueda fuzzy en BD
                                for (Vino v : todosVinos) {
                                        String nombreCompleto = v.getNombre().toLowerCase();
                                        if (nombreCompleto.contains(busquedaVino.toLowerCase()) ||
                                                        busquedaVino.toLowerCase().contains(nombreCompleto)) {
                                                Map<String, Object> itemMap = new HashMap<>();
                                                itemMap.put("vinoId", v.getId());
                                                itemMap.put("cantidad", cantidad);
                                                itemsEncontrados.add(itemMap);
                                                break; // Tomar el primer match
                                        }
                                }
                        }
                }

                if (itemsEncontrados.isEmpty()) {
                        return "{\"reply\": \"No pude encontrar los vinos mencionados en el catálogo. ¿Podrías ser más específico?\", \"action\": \"NONE\"}";
                }

                // Construir respuesta
                Map<String, Object> response = new HashMap<>();
                response.put("reply", "Perfecto, he anotado el pedido para " + clienteNombre);
                response.put("action", "CREATE_ORDER");

                Map<String, Object> data = new HashMap<>();
                data.put("clienteId", clienteId);
                data.put("items", itemsEncontrados);
                response.put("data", data);

                return objectMapper.writeValueAsString(response);
        }

        // Procesar recomendación
        private String procesarRecomendacion(String message) throws Exception {
                String catalogoResumen = getCatalogoResumen();

                String prompt = """
                                Eres un sumiller experto.

                                CATÁLOGO:
                                %s

                                USUARIO: "%s"

                                Recomienda 3 vinos del catálogo con razón breve.

                                RESPUESTA JSON:
                                {
                                  "reply": "Aquí tienes mis recomendaciones...",
                                  "action": "RECOMMENDATION",
                                  "data": {
                                    "vinos": [
                                      {"vinoId": "...", "nombre": "...", "razon": "..."}
                                    ]
                                  }
                                }
                                """
                                .formatted(catalogoResumen, message);

                return callAi(prompt);
        }
}
