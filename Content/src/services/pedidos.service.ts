import { api } from '../lib/api';
import type { Pedido, LineaPedido } from '../types';

// Define types that match what the store expects
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
   * Obtener todos los pedidos con información del cliente
   */
  async getAll() {
    const data = await api.get('/pedidos');
    return data as PedidoCompleto[];
  },

  /**
   * Obtener un pedido completo por ID (con cliente y líneas)
   */
  async getById(id: string) {
    const data = await api.get(`/pedidos/${id}`);
    return data as PedidoCompleto;
  },

  /**
   * Obtener pedidos de un cliente específico con líneas para búsqueda
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
   * Crear un nuevo pedido con sus líneas
   */
  /**
   * Crear un nuevo pedido con sus líneas
   */
  /**
   * Crear un nuevo pedido con sus líneas
   */
  async create(
    pedidoData: PedidoInsert,
    lineasData: Omit<LineaPedidoInsert, 'pedido_id'>[]
  ) {
    // Transformar datos para que coincidan con la estructura del Backend (JPA/Hibernate)
    const pedidoBackend = {
      numero: pedidoData.numero,
      cliente: { id: pedidoData.clienteId },
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
    await api.post(`/pedidos/${id}/delete`, {});
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
