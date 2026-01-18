import { api } from '../lib/api';

const API_URL = 'http://localhost:8080/api';

export interface AIRecommendation {
    vinoId: string;
    nombre: string;
    salesPitch: string;
}

export interface AIParsedItem {
    vinoId: string | null;
    nombreDetectado: string;
    cantidad: number;
}

export interface AIParsedOrder {
    items: AIParsedItem[];
}

export interface AISearchResult {
    vinoId: string;
    nombre: string;
    razon: string;
}

export const aiService = {
    getRecommendations: async (clienteId: string): Promise<AIRecommendation[]> => {
        const response = await api.get(`/ai/recommendations/${clienteId}`);
        console.log('🤖 AI Recommendations Response:', response, 'Type:', typeof response);
        // Response is the payload.
        if (Array.isArray(response)) return response;
        if (typeof response === 'string') {
            try {
                const clean = response.replace(/```json/g, '').replace(/```/g, '');
                const parsed = JSON.parse(clean);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error("Failed to parse AI response", e);
                return [];
            }
        }
        return []; // Fallback if not array or string
    },

    getInsights: async (clienteId: string): Promise<string> => {
        try {
            const token = localStorage.getItem('vinia_token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/ai/insights/${clienteId}`, {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // Get text directly without JSON parsing
            const text = await response.text();

            // Clean markdown formatting if present
            let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();

            // Remove quotes if the entire response is wrapped in quotes
            if (clean.startsWith('"') && clean.endsWith('"')) {
                clean = clean.slice(1, -1);
            }

            return clean || 'Analizando datos del cliente...';
        } catch (error) {
            console.error('Error loading insights:', error);
            return 'No se pudieron cargar los insights en este momento.';
        }
    },

    parseOrder: async (text: string): Promise<AIParsedOrder> => {
        const response = await api.post('/ai/parse-order', { text });
        if (response && Array.isArray(response.items)) return response;
        if (typeof response === 'string') {
            try {
                const clean = response.replace(/```json/g, '').replace(/```/g, '');
                const parsed = JSON.parse(clean);
                return (parsed && Array.isArray(parsed.items)) ? parsed : { items: [] };
            } catch (e) {
                console.error("Failed to parse AI response", e);
                return { items: [] };
            }
        }
        return { items: [] };
    },

    semanticSearch: async (query: string): Promise<AISearchResult[]> => {
        try {
            const response = await fetch(`${API_URL}/ai/search?query=${encodeURIComponent(query)}`);
            const text = await response.text();

            // Clean markdown
            let clean = text;
            if (clean.includes("```json")) {
                clean = clean.replace(/```json/g, "").replace(/```/g, "");
            }

            const results = JSON.parse(clean);
            return Array.isArray(results) ? results : [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    chat: async (message: string, context: any): Promise<any> => {
        try {
            const token = localStorage.getItem('vinia_token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ message, context: JSON.stringify(context) })
            });

            if (!response.ok) {
                console.error('Chat API Error:', response.status, response.statusText);
                return { reply: "Error de conexión con VinIA", action: "NONE" };
            }

            const text = await response.text();

            // Clean markdown if needed
            let clean = text;
            if (clean.includes("```json")) {
                clean = clean.replace(/```json/g, "").replace(/```/g, "");
            }

            return JSON.parse(clean);
        } catch (error) {
            console.error("Chat Error:", error);
            return { reply: "Error de conexión con VinIA", action: "NONE" };
        }
    }
};
