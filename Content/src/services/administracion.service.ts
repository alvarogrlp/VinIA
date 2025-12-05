import { api } from '../lib/api';
import type { EstadisticasComercial } from '../types';

export const administracionService = {
  /**
   * Asignar cliente a comercial
   */
  async asignarCliente(clienteId: string, comercialId: string, adminId: string) {
    const data = await api.post('/administracion/asignar', {
      clienteId,
      comercialId,
      adminId
    });
    return data;
  },

  /**
   * Obtener clientes asignados a un comercial
   */
  async obtenerClientesComercial(comercialId: string) {
    const data = await api.get(`/administracion/comercial/${comercialId}/clientes`);
    return data;
  },

  /**
   * Obtener todas las asignaciones activas
   */
  async obtenerTodasAsignaciones() {
    const data = await api.get('/administracion/asignaciones');
    return data;
  },

  /**
   * Obtener estadísticas de un comercial
   */
  async obtenerEstadisticasComercial(comercialId: string): Promise<EstadisticasComercial> {
    const data = await api.get(`/administracion/comercial/${comercialId}/stats-full`);
    return data;
  },

  /**
   * Obtener todos los comerciales con sus estadísticas resumidas
   */
  async obtenerResumenComerciales() {
    const data = await api.get('/administracion/comerciales/resumen');
    return data;
  },

  /**
   * Desasignar cliente de comercial
   */
  async desasignarCliente(clienteId: string, comercialId: string) {
    await api.post('/administracion/desasignar', {
      clienteId,
      comercialId
    });
  },

  /**
   * Obtener clientes sin asignar
   */
  async obtenerClientesSinAsignar() {
    const data = await api.get('/administracion/clientes/sin-asignar');
    return data;
  },

  /**
   * Reasignar cliente a otro comercial
   */
  async reasignarCliente(clienteId: string, nuevoComercialId: string, adminId: string) {
    const data = await api.post('/administracion/reasignar', {
      clienteId,
      nuevoComercialId,
      adminId
    });
    return data;
  }
};
