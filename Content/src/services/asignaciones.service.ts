/**
 * Servicio de Asignaciones
 * 
 * Gestiona la asignación de clientes a comerciales
 */

import { supabase } from '../lib/supabase';

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
    // Usamos la versión v2 que devuelve JSON para evitar errores de tipos
    const { data, error } = await supabase.rpc('obtener_clientes_comercial_v2', {
      p_comercial_id: comercialId
    });

    if (error) throw error;
    return data || [];
  },

  /**
   * Asignar un cliente a un comercial
   */
  async asignarCliente(clienteId: string, comercialId: string, adminId: string) {
    // Llamada RPC a la versión v2 para evitar conflictos de tipos
    const { data, error } = await supabase.rpc('asignar_cliente_comercial_v2', {
      p_cliente_id: clienteId,
      p_comercial_id: comercialId,
      p_admin_id: adminId
    });

    if (error) throw error;
    return data;
  },

  /**
   * Desasignar un cliente (soft delete en la tabla de asignaciones)
   * Nota: Usamos update directo porque no hay RPC específico para desasignar,
   * pero la tabla tiene columna 'activo'.
   */
  async desasignarCliente(clienteId: string, comercialId: string) {
    const { error } = await supabase
      .from('asignaciones_cliente_comercial')
      .update({ activo: false })
      .match({ cliente_id: clienteId, comercial_id: comercialId });

    if (error) throw error;
  },

  /**
   * Obtener estadísticas de un comercial
   */
  async getEstadisticasComercial(comercialId: string): Promise<EstadisticasComercial> {
    const { data, error } = await supabase.rpc('obtener_estadisticas_comercial', {
      p_comercial_id: comercialId
    });

    if (error) throw error;
    return data;
  }
};
