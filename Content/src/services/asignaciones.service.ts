import { api } from '../lib/api';

export interface ClienteAsignado {
  cliente_id: string;
  cliente_nombre: string;
  cliente_cif: string;
  cliente_tipo: string;
  fecha_asignacion: string;
  num_pedidos: number;
  total_comprado: number;
}

export interface EstadisticasComercial {
  comercial_id: string;
  comercial_nombre: string;
  total_ventas: number;
  num_pedidos: number;
  num_clientes: number;
  ticket_medio: number;
}

export const asignacionesService = {
  /**
   * Obtener clientes asignados a un comercial
   */
  async getClientesComercial(comercialId: string): Promise<ClienteAsignado[]> {
    const data = await api.get(`/asignaciones/comercial/${comercialId}/clientes`);
    return data || [];
  },

  /**
   * Asignar un cliente a un comercial
   */
  async asignarCliente(clienteId: string, comercialId: string, adminId: string) {
    const data = await api.post('/asignaciones', {
      clienteId,
      comercialId,
      adminId
    });
    return data;
  },

  /**
   * Desasignar un cliente
   */
  async desasignarCliente(clienteId: string, comercialId: string) {
    await api.post('/asignaciones/desasignar', {
      clienteId,
      comercialId
    });
  },

  /**
   * Obtener estadísticas de un comercial
   */
  async getEstadisticasComercial(comercialId: string): Promise<EstadisticasComercial> {
    const data = await api.get(`/asignaciones/comercial/${comercialId}/stats`);
    return data;
  }
};
