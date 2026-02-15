import { api } from '../lib/api';
import type { Vino } from '../types';

type VinoInsert = Omit<Vino, 'id' | 'created_at' | 'updated_at'>;
type VinoUpdate = Partial<VinoInsert>;
type VinoWithAIReason = Vino & { _aiReason?: string };

export const vinosService = {
  /**
   * Obtener todos los vinos activos
   */
  async getAll() {

    const data = await api.get('/vinos');


    return data as Vino[];
  },

  /**
   * Obtener un vino por ID
   */
  async getById(id: string) {
    const data = await api.get(`/vinos/${id}`);
    return data as Vino;
  },

  /**
   * Buscar vinos por texto en múltiples campos
   * Busca en: nombre, bodega, región, denominación origen, variedad uva,
   * descripción, notas cata, código interno, tipo
   */
  async search(query: string) {
    if (!query || query.trim().length === 0) {
      return this.getAll();
    }

    const searchTerm = query.trim();


    const data = await api.get(`/vinos?search=${encodeURIComponent(searchTerm)}`);


    return data as Vino[];
  },

  /**
   * Filtrar vinos por criterios
   */
  async filter(filters: {
    tipo?: string;
    precioMin?: number;
    precioMax?: number;
    denominacionOrigen?: string;
    stock?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (filters.tipo) queryParams.append('tipo', filters.tipo);
    if (filters.precioMin) queryParams.append('precioMin', filters.precioMin.toString());
    if (filters.precioMax) queryParams.append('precioMax', filters.precioMax.toString());
    if (filters.denominacionOrigen) queryParams.append('denominacionOrigen', filters.denominacionOrigen);
    if (filters.stock) queryParams.append('stock', filters.stock.toString());

    const data = await api.get(`/vinos/filter?${queryParams.toString()}`);
    return data as Vino[];
  },

  /**
   * Crear un nuevo vino
   */
  async create(vino: VinoInsert) {
    const data = await api.post('/vinos', vino);
    return data as Vino;
  },

  /**
   * Actualizar un vino
   */
  async update(id: string, vino: VinoUpdate) {
    const data = await api.put(`/vinos/${id}`, vino);
    return data as Vino;
  },

  /**
   * Eliminar un vino (soft delete)
   */
  async delete(id: string) {
    await api.delete(`/vinos/${id}`);
  },

  /**
   * Actualizar stock de un vino
   * Usa endpoint dedicado para mayor seguridad y consistencia.
   */
  async updateStock(id: string, cantidad: number) {
    const data = await api.post(`/vinos/${id}/stock`, { cantidad });
    return data as Vino;
  },

  /**
   * Obtener vinos con bajo stock
   */
  async getLowStock(threshold: number = 10) {
    const data = await api.get(`/vinos/low-stock?threshold=${threshold}`);
    return data as Vino[];
  },

  /**
   * Insertar múltiples vinos (para seeding)
   */
  async createBulk(vinos: VinoInsert[]) {
    const data = await api.post('/vinos/bulk', vinos);
    return data as Vino[];
  },

  /**
   * Búsqueda avanzada con filtros múltiples y scoring
   * Prioriza resultados que coinciden en campos más relevantes
   */
  async advancedSearch(query: string): Promise<VinoWithAIReason[]> {
    if (!query || query.trim().length === 0) {
      const vinos = await this.getAll();
      return vinos.map(v => ({ ...v, _aiReason: undefined }));
    }



    try {
      // 1. Obtener IDs y Razones desde la IA

      const aiResponse = await api.get(`/ai/search?query=${encodeURIComponent(query)}`);

      // Si la respuesta es vacía o error
      if (!Array.isArray(aiResponse) || aiResponse.length === 0) {
        console.warn('IA no devolvió resultados, fallback a búsqueda sql');
        const vinos = await this.search(query);
        return vinos.map(v => ({ ...v, _aiReason: undefined }));
      }

      // 2. Obtener catálogo completo para hidratar datos (Optimización: Podríamos tener un endpoint /bulk)
      const allVinos = await this.getAll();

      // 3. Cruzar datos manteniendo el orden de relevancia de la IA
      const resultados: VinoWithAIReason[] = aiResponse
        .map((item: any) => {
          const vinoReal = allVinos.find(v => v.id === item.vinoId);
          if (vinoReal) {
            // Inyectamos la razón como propiedad temporal por si la UI quiere usarla
            return { ...vinoReal, _aiReason: item.razon } as VinoWithAIReason;
          }
          return null;
        })
        .filter((v): v is VinoWithAIReason => v !== null);


      return resultados;

    } catch (error) {
      console.error('Error en búsqueda IA:', error);
      // Fallback a búsqueda normal
      const vinos = await this.search(query);
      return vinos.map(v => ({ ...v, _aiReason: undefined }));
    }
  }
};
