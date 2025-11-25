/**
 * Servicio de Administración
 * 
 * Gestiona asignaciones de clientes a comerciales y estadísticas
 */

import { supabase } from '../lib/supabase';
import type { EstadisticasComercial } from '../types';

export const administracionService = {
  /**
   * Asignar cliente a comercial
   */
  async asignarCliente(clienteId: string, comercialId: string, adminId: string) {
    const { data, error } = await supabase.rpc('asignar_cliente_comercial', {
      p_cliente_id: clienteId,
      p_comercial_id: comercialId,
      p_admin_id: adminId
    });

    if (error) throw error;
    return data;
  },

  /**
   * Obtener clientes asignados a un comercial
   */
  async obtenerClientesComercial(comercialId: string) {
    const { data, error } = await supabase.rpc('obtener_clientes_comercial', {
      p_comercial_id: comercialId
    });

    if (error) throw error;
    return data;
  },

  /**
   * Obtener todas las asignaciones activas
   */
  async obtenerTodasAsignaciones() {
    const { data, error } = await supabase
      .from('asignaciones_cliente_comercial')
      .select(`
        *,
        cliente:clientes(id, nombre, cif, tipo),
        comercial:usuarios!comercial_id(id, nombre, apellidos, username)
      `)
      .eq('activo', true)
      .order('fecha_asignacion', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Obtener estadísticas de un comercial
   */
  async obtenerEstadisticasComercial(comercialId: string): Promise<EstadisticasComercial> {
    const { data, error } = await supabase.rpc('obtener_estadisticas_comercial', {
      p_comercial_id: comercialId
    });

    if (error) throw error;

    // Obtener vinos más vendidos
    const { data: vinosMasVendidos } = await supabase.rpc('obtener_vinos_mas_vendidos_comercial', {
      p_comercial_id: comercialId,
      p_limit: 5
    });

    // Obtener vinos menos vendidos
    const { data: vinosMenosVendidos } = await supabase.rpc('obtener_vinos_menos_vendidos_comercial', {
      p_comercial_id: comercialId,
      p_limit: 5
    });

    // Obtener pedidos por estado
    const { data: pedidosPorEstado } = await supabase
      .from('pedidos')
      .select('estado')
      .in('cliente_id', 
        await supabase
          .from('asignaciones_cliente_comercial')
          .select('cliente_id')
          .eq('comercial_id', comercialId)
          .eq('activo', true)
          .then(res => res.data?.map(a => a.cliente_id) || [])
      );

    // Agrupar pedidos por estado
    const estadosAgrupados = pedidosPorEstado?.reduce((acc: any, p: any) => {
      acc[p.estado] = (acc[p.estado] || 0) + 1;
      return acc;
    }, {});

    return {
      ...data,
      vinos_mas_vendidos: vinosMasVendidos || [],
      vinos_menos_vendidos: vinosMenosVendidos || [],
      pedidos_por_estado: Object.entries(estadosAgrupados || {}).map(([estado, cantidad]) => ({
        estado: estado as any,
        cantidad: cantidad as number
      })),
      ventas_por_mes: []
    };
  },

  /**
   * Obtener todos los comerciales con sus estadísticas resumidas
   */
  async obtenerResumenComerciales() {
    const { data: comerciales, error } = await supabase
      .from('usuarios')
      .select('id, username, nombre, apellidos, activo')
      .eq('rol', 'Comercial')
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;

    // Obtener estadísticas básicas de cada comercial
    const comercialesConStats = await Promise.all(
      (comerciales || []).map(async (comercial) => {
        const { data: stats } = await supabase.rpc('obtener_estadisticas_comercial', {
          p_comercial_id: comercial.id
        });

        return {
          ...comercial,
          stats: stats || {
            total_ventas: 0,
            num_pedidos: 0,
            num_clientes: 0,
            ticket_medio: 0
          }
        };
      })
    );

    return comercialesConStats;
  },

  /**
   * Desasignar cliente de comercial
   */
  async desasignarCliente(clienteId: string, comercialId: string) {
    const { error } = await supabase
      .from('asignaciones_cliente_comercial')
      .update({ activo: false })
      .eq('cliente_id', clienteId)
      .eq('comercial_id', comercialId)
      .eq('activo', true);

    if (error) throw error;
  },

  /**
   * Obtener clientes sin asignar
   */
  async obtenerClientesSinAsignar() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .not('id', 'in', 
        await supabase
          .from('asignaciones_cliente_comercial')
          .select('cliente_id')
          .eq('activo', true)
          .then(res => res.data?.map(a => a.cliente_id) || [])
      );

    if (error) throw error;
    return data;
  },

  /**
   * Reasignar cliente a otro comercial
   */
  async reasignarCliente(clienteId: string, nuevoComercialId: string, adminId: string) {
    // Desactivar asignación actual
    await supabase
      .from('asignaciones_cliente_comercial')
      .update({ activo: false })
      .eq('cliente_id', clienteId)
      .eq('activo', true);

    // Crear nueva asignación
    return this.asignarCliente(clienteId, nuevoComercialId, adminId);
  }
};
