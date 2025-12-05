import { api } from '../lib/api';
import type { Cliente } from '../types';

type ClienteInsert = Omit<Cliente, 'id' | 'created_at' | 'updated_at'>;
type ClienteUpdate = Partial<ClienteInsert>;

export const clientesService = {
  /**
   * Obtener todos los clientes activos
   * Si se pasa userId y el rol es Comercial, filtra por asignaciones
   */
  async getAll(userId?: string, role?: string) {
    const queryParams = new URLSearchParams();
    if (userId) queryParams.append('userId', userId);
    if (role) queryParams.append('role', role);

    const data = await api.get(`/clientes?${queryParams.toString()}`);
    return data as Cliente[];
  },

  /**
   * Obtener un cliente por ID
   */
  async getById(id: string) {
    const data = await api.get(`/clientes/${id}`);
    return data as Cliente;
  },

  /**
   * Buscar clientes por texto (nombre, CIF, email)
   */
  async search(query: string) {
    const data = await api.get(`/clientes/search?q=${encodeURIComponent(query)}`);
    return data as Cliente[];
  },

  /**
   * Filtrar clientes por tipo
   */
  async filterByType(tipo: string) {
    const data = await api.get(`/clientes/filter?tipo=${encodeURIComponent(tipo)}`);
    return data as Cliente[];
  },

  /**
   * Crear un nuevo cliente
   */
  async create(cliente: ClienteInsert) {
    const data = await api.post('/clientes', cliente);
    return data as Cliente;
  },

  /**
   * Actualizar un cliente
   */
  async update(id: string, cliente: ClienteUpdate) {
    const data = await api.post(`/clientes/${id}`, cliente);
    return data as Cliente;
  },

  /**
   * Eliminar un cliente (soft delete)
   */
  async delete(id: string) {
    await api.post(`/clientes/${id}/delete`, {});
  },

  /**
   * Obtener estadísticas de un cliente
   */
  async getStats(clienteId: string) {
    const data = await api.get(`/clientes/${clienteId}/stats`);
    return data;
  },

  /**
   * Insertar múltiples clientes (para seeding)
   */
  async createBulk(clientes: ClienteInsert[]) {
    const data = await api.post('/clientes/bulk', clientes);
    return data as Cliente[];
  },

  /**
   * Obtener análisis completo del cliente (historial, top productos, etc.)
   */
  async getAnalisis(clienteId: string) {
    const data = await api.get(`/clientes/${clienteId}/analysis`);
    return data;
  },
};
