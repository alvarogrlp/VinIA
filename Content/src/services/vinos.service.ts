import { api } from '../lib/api';
import type { Vino } from '../types';

type VinoInsert = Omit<Vino, 'id' | 'created_at' | 'updated_at'>;
type VinoUpdate = Partial<VinoInsert>;

export const vinosService = {
  /**
   * Obtener todos los vinos activos
   */
  async getAll() {
    console.log('📡 Consultando API: GET /vinos');
    const data = await api.get('/vinos');

    console.log('✅ Datos recibidos de API:', data?.length || 0, 'registros');
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
    console.log('🔍 Buscando:', searchTerm);

    const data = await api.get(`/vinos/search?q=${encodeURIComponent(searchTerm)}`);

    console.log('✅ Resultados encontrados:', data?.length || 0);
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
  async advancedSearch(query: string) {
    if (!query || query.trim().length === 0) {
      return this.getAll();
    }

    const searchTerm = query.trim();
    console.log('🔍 Búsqueda avanzada:', searchTerm);

    const data = await api.get(`/vinos/advanced-search?q=${encodeURIComponent(searchTerm)}`);
    return data as Vino[];
  }
};
