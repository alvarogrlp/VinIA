/**
 * Servicio de Pedidos
 * 
 * Gestiona todas las operaciones CRUD con las tablas de pedidos y líneas de pedido en Supabase
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Pedido = Database['public']['Tables']['pedidos']['Row'];
type PedidoInsert = Database['public']['Tables']['pedidos']['Insert'];
type PedidoUpdate = Database['public']['Tables']['pedidos']['Update'];
type LineaPedido = Database['public']['Tables']['lineas_pedido']['Row'];
type LineaPedidoInsert = Database['public']['Tables']['lineas_pedido']['Insert'];

export interface PedidoCompleto extends Pedido {
  cliente: {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
  };
  lineas: Array<LineaPedido & {
    vino: {
      id: string;
      nombre: string;
      bodega: string;
      precio: number;
    };
  }>;
}

export const pedidosService = {
  /**
   * Obtener todos los pedidos con información del cliente
   */
  async getAll() {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes (
          id,
          nombre,
          email,
          telefono
        )
      `)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data as PedidoCompleto[];
  },

  /**
   * Obtener un pedido completo por ID (con cliente y líneas)
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes (
          id,
          nombre,
          email,
          telefono
        ),
        lineas:lineas_pedido (
          *,
          vino:vinos (
            id,
            nombre,
            bodega,
            precio
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as PedidoCompleto;
  },

  /**
   * Obtener pedidos de un cliente específico con líneas para búsqueda
   */
  async getByCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes (
          id,
          nombre,
          email,
          telefono
        ),
        lineas:lineas_pedido (
          *,
          vino:vinos (
            id,
            nombre,
            bodega
          )
        )
      `)
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data as PedidoCompleto[];
  },

  /**
   * Filtrar pedidos por estado
   */
  async filterByEstado(estado: string) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        cliente:clientes (
          id,
          nombre,
          email,
          telefono
        )
      `)
      .eq('estado', estado)
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data as PedidoCompleto[];
  },

  /**
   * Crear un nuevo pedido con sus líneas
   */
  async create(
    pedido: PedidoInsert,
    lineas: Omit<LineaPedidoInsert, 'pedido_id'>[]
  ) {
    // Crear el pedido
    const { data: pedidoCreado, error: pedidoError } = await supabase
      .from('pedidos')
      .insert(pedido)
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // Crear las líneas del pedido
    const lineasConPedidoId = lineas.map(linea => ({
      ...linea,
      pedido_id: pedidoCreado.id
    }));

    const { error: lineasError } = await supabase
      .from('lineas_pedido')
      .insert(lineasConPedidoId);

    if (lineasError) throw lineasError;

    // Devolver el pedido completo
    return this.getById(pedidoCreado.id);
  },

  /**
   * Actualizar el estado de un pedido
   */
  async updateEstado(id: string, estado: PedidoUpdate['estado']) {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Pedido;
  },

  /**
   * Actualizar un pedido completo
   */
  async update(id: string, pedido: PedidoUpdate) {
    const { data, error } = await supabase
      .from('pedidos')
      .update(pedido)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Pedido;
  },

  /**
   * Eliminar un pedido (y sus líneas en cascada)
   */
  async delete(id: string) {
    // Las líneas se eliminarán automáticamente por la relación en cascada
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Obtener estadísticas de pedidos
   */
  async getStats() {
    const { data, error } = await supabase
      .from('pedidos')
      .select('total, estado, fecha');

    if (error) throw error;

    const totalVentas = data?.reduce((sum, p) => sum + p.total, 0) || 0;
    const totalPedidos = data?.length || 0;
    const pedidosPendientes = data?.filter(p => p.estado === 'Pendiente').length || 0;
    const pedidosEntregados = data?.filter(p => p.estado === 'Entregado').length || 0;

    return {
      totalVentas,
      totalPedidos,
      pedidosPendientes,
      pedidosEntregados
    };
  },

  /**
   * Generar número de pedido automático
   */
  async generateNumeroPedido() {
    const { data, error } = await supabase
      .from('pedidos')
      .select('numero_pedido')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      return 'PED-0001';
    }

    const lastNumber = Number.parseInt(data[0].numero_pedido.split('-')[1], 10);
    const newNumber = lastNumber + 1;
    return `PED-${newNumber.toString().padStart(4, '0')}`;
  }
};
