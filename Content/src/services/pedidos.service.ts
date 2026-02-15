import { api } from '../lib/api';
import type { Pedido, LineaPedido } from '../types';

// Define types that match what the store expects
/**
 * Enhanced Order Type containing full nested relationships.
 * 
 * Used for detailed views where client and wine information is required
 * without separate API calls.
 */
export interface PedidoCompleto extends Omit<Pedido, 'cliente'> {
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

type PedidoInsert = Omit<Pedido, 'id' | 'created_at' | 'updated_at' | 'cliente' | 'lineas'>;
type LineaPedidoInsert = Omit<LineaPedido, 'id' | 'vino' | 'vinoNombre'>;

export const pedidosService = {
  /**
   * Retrieves all orders from the backend.
   * 
   * @returns A promise resolving to an array of full order objects.
   */
  async getAll() {
    const data = await api.get('/pedidos');
    return data as PedidoCompleto[];
  },

  /**
   * Retrieves a specific order by ID.
   * 
   * @param id The ID of the order.
   * @returns The full order details.
   */
  async getById(id: string) {
    const data = await api.get(`/pedidos/${id}`);
    return data as PedidoCompleto;
  },

  /**
   * Retrieves history of orders for a specific client.
   * 
   * @param clienteId The ID of the client.
   * @returns List of orders associated with the client.
   */
  async getByCliente(clienteId: string) {
    const data = await api.get(`/pedidos/cliente/${clienteId}`);
    return data as PedidoCompleto[];
  },

  /**
   * Filtrar pedidos por estado
   */
  async filterByEstado(estado: string) {
    const data = await api.get(`/pedidos/filter?estado=${encodeURIComponent(estado)}`);
    return data as PedidoCompleto[];
  },

  /**
   * Creates a new order.
   * 
   * Transforms the frontend data structure into the specific JSON format
   * expected by the Spring Boot backend (nesting IDs).
   * 
   * @param pedidoData The basic order information.
   * @param lineasData The array of line items.
   * @returns The created order response.
   */
  async create(
    pedidoData: PedidoInsert,
    lineasData: Omit<LineaPedidoInsert, 'pedido_id'>[]
  ) {
    // Resolve the client ID from either the pre-nested 'cliente' object
    // (set by guardarPedido in the store) or from the flat 'clienteId' field.
    const clienteRef = (pedidoData as any).cliente?.id
      || pedidoData.clienteId
      || (pedidoData as any).cliente_id;

    if (!clienteRef) {
      throw new Error('No se puede crear el pedido: falta el ID del cliente.');
    }

    // Transformar datos para que coincidan con la estructura del Backend (JPA/Hibernate)
    const pedidoBackend = {
      numero: pedidoData.numero,
      cliente: { id: clienteRef },
      fecha: pedidoData.fecha,
      estado: pedidoData.estado || 'PENDIENTE_VALIDACION',
      subtotal: pedidoData.subtotal,
      descuento: pedidoData.descuento,
      iva: pedidoData.iva,
      total: pedidoData.total,
      notas: pedidoData.notas,
      instruccionesEntrega: pedidoData.instruccionesEntrega,
      direccionEnvioSnapshot: pedidoData.direccionEnvioSnapshot,
      formaPago: pedidoData.formaPago,
      usuario: pedidoData.usuario ? { id: pedidoData.usuario.id } : (pedidoData.usuarioId ? { id: pedidoData.usuarioId } : undefined),
      lineas: lineasData.map(linea => ({
        vino: { id: linea.vinoId },
        cantidad: linea.cantidad,
        precioUnitario: linea.precioUnitario,
        descuento: linea.descuento,
        subtotal: linea.subtotal,
        anada: linea.anada,
        lote: linea.lote,
        tipoBulto: linea.tipoBulto,
        cantidadBultos: linea.cantidadBultos
      }))
    };

    console.log('📦 Sending order to backend:', JSON.stringify(pedidoBackend, null, 2));

    // El backend espera un único objeto Pedido que contiene la lista de líneas
    const data = await api.post('/pedidos', pedidoBackend);
    return data as PedidoCompleto;
  },

  /**
   * Actualizar el estado de un pedido
   */
  async updateEstado(id: string, estado: string) {
    const data = await api.post(`/pedidos/${id}/estado`, { estado });
    return data as Pedido;
  },

  /**
   * Actualizar un pedido completo
   */
  async update(id: string, pedido: Partial<Pedido>) {
    const data = await api.post(`/pedidos/${id}`, pedido);
    return data as Pedido;
  },

  /**
   * Eliminar un pedido (y sus líneas en cascada)
   */
  async delete(id: string) {
    await api.delete(`/pedidos/${id}`);
  },

  /**
   * Obtener estadísticas de pedidos
   */
  async getStats() {
    const data = await api.get('/pedidos/stats');
    return data;
  },

  /**
   * Generar número de pedido automático
   */
  async generateNumeroPedido() {
    const data = await api.get('/pedidos/next-number');
    return data.numero;
  }
};
