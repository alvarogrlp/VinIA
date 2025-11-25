/**
 * Servicio de Clientes
 * 
 * Gestiona todas las operaciones CRUD con la tabla de clientes en Supabase
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Cliente = Database['public']['Tables']['clientes']['Row'];
type ClienteInsert = Database['public']['Tables']['clientes']['Insert'];
type ClienteUpdate = Database['public']['Tables']['clientes']['Update'];

export const clientesService = {
  /**
   * Obtener todos los clientes activos
   * Si se pasa userId y el rol es Comercial, filtra por asignaciones
   */
  async getAll(userId?: string, role?: string) {
    let query = supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    // Si es comercial, filtrar por asignaciones activas
    if (role === 'Comercial' && userId) {
      const { data, error } = await supabase
        .from('clientes')
        .select('*, asignaciones_cliente_comercial!inner(comercial_id)')
        .eq('activo', true)
        .eq('asignaciones_cliente_comercial.comercial_id', userId)
        .eq('asignaciones_cliente_comercial.activo', true)
        .order('nombre', { ascending: true });

      if (error) throw error;
      
      // Limpiar la propiedad de la relación para devolver solo el cliente
      return data.map((item: any) => {
        const { asignaciones_cliente_comercial, ...cliente } = item;
        return cliente;
      }) as Cliente[];
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Cliente[];
  },

  /**
   * Obtener un cliente por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  /**
   * Buscar clientes por texto (nombre, CIF, email)
   */
  async search(query: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .or(`nombre.ilike.%${query}%,cif.ilike.%${query}%,email.ilike.%${query}%`)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data as Cliente[];
  },

  /**
   * Filtrar clientes por tipo
   */
  async filterByType(tipo: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .eq('tipo', tipo)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data as Cliente[];
  },

  /**
   * Crear un nuevo cliente
   */
  async create(cliente: ClienteInsert) {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  /**
   * Actualizar un cliente
   */
  async update(id: string, cliente: ClienteUpdate) {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  /**
   * Eliminar un cliente (soft delete)
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('clientes')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Obtener estadísticas de un cliente
   */
  async getStats(clienteId: string) {
    // Obtener pedidos del cliente
    const { data: pedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('total, estado')
      .eq('cliente_id', clienteId);

    if (pedidosError) throw pedidosError;

    // Calcular estadísticas
    const totalCompras = pedidos?.reduce((sum, p) => sum + p.total, 0) || 0;
    const pedidosCount = pedidos?.length || 0;
    const pedidosPendientes = pedidos?.filter(p => p.estado === 'Pendiente').length || 0;

    return {
      totalCompras,
      pedidosCount,
      pedidosPendientes
    };
  },

  /**
   * Insertar múltiples clientes (para seeding)
   */
  async createBulk(clientes: ClienteInsert[]) {
    const { data, error } = await supabase
      .from('clientes')
      .insert(clientes)
      .select();

    if (error) throw error;
    return data as Cliente[];
  },

  /**
   * Obtener análisis completo del cliente (historial, top productos, etc.)
   */
  async getAnalisis(clienteId: string) {
    const { data, error } = await supabase.rpc('obtener_analisis_cliente', {
      p_cliente_id: clienteId
    });

    if (error) throw error;
    return data;
  },
};
