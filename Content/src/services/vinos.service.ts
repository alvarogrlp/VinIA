/**
 * Servicio de Vinos
 * 
 * Gestiona todas las operaciones CRUD con la tabla de vinos en Supabase
 */

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Vino = Database['public']['Tables']['vinos']['Row'];
type VinoInsert = Database['public']['Tables']['vinos']['Insert'];
type VinoUpdate = Database['public']['Tables']['vinos']['Update'];

export const vinosService = {
  /**
   * Obtener todos los vinos activos
   */
  async getAll() {
    console.log('📡 Consultando Supabase: SELECT * FROM vinos WHERE activo = true');
    const { data, error } = await supabase
      .from('vinos')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('❌ Error en Supabase:', error);
      throw error;
    }
    
    console.log('✅ Datos recibidos de Supabase:', data?.length || 0, 'registros');
    return data as Vino[];
  },

  /**
   * Obtener un vino por ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('vinos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
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
    
    // Búsqueda en múltiples campos con OR
    const { data, error } = await supabase
      .from('vinos')
      .select('*')
      .eq('activo', true)
      .or(`nombre.ilike.%${searchTerm}%,bodega.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%,denominacion_origen.ilike.%${searchTerm}%,variedad_uva.ilike.%${searchTerm}%,tipo.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%,notas_cata.ilike.%${searchTerm}%,codigo_interno.ilike.%${searchTerm}%,aroma.ilike.%${searchTerm}%,sabor.ilike.%${searchTerm}%`)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('❌ Error en búsqueda:', error);
      throw error;
    }
    
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
    let query = supabase
      .from('vinos')
      .select('*')
      .eq('activo', true);

    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo);
    }
    if (filters.precioMin !== undefined) {
      query = query.gte('precio_unitario', filters.precioMin);
    }
    if (filters.precioMax !== undefined) {
      query = query.lte('precio_unitario', filters.precioMax);
    }
    if (filters.denominacionOrigen) {
      query = query.eq('denominacion_origen', filters.denominacionOrigen);
    }
    if (filters.stock !== undefined) {
      query = query.gte('stock', filters.stock);
    }

    query = query.order('nombre', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data as Vino[];
  },

  /**
   * Crear un nuevo vino
   */
  async create(vino: VinoInsert) {
    const { data, error } = await supabase
      .from('vinos')
      .insert(vino)
      .select()
      .single();

    if (error) throw error;
    return data as Vino;
  },

  /**
   * Actualizar un vino
   */
  async update(id: string, vino: VinoUpdate) {
    const { data, error } = await supabase
      .from('vinos')
      .update(vino)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Vino;
  },

  /**
   * Eliminar un vino (soft delete)
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('vinos')
      .update({ activo: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Actualizar stock de un vino
   */
  async updateStock(id: string, cantidad: number) {
    const { data, error } = await supabase
      .from('vinos')
      .update({ stock: cantidad })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Vino;
  },

  /**
   * Obtener vinos con bajo stock
   */
  async getLowStock(threshold: number = 10) {
    const { data, error } = await supabase
      .from('vinos')
      .select('*')
      .eq('activo', true)
      .lte('stock', threshold)
      .order('stock', { ascending: true });

    if (error) throw error;
    return data as Vino[];
  },

  /**
   * Insertar múltiples vinos (para seeding)
   */
  async createBulk(vinos: VinoInsert[]) {
    const { data, error } = await supabase
      .from('vinos')
      .insert(vinos)
      .select();

    if (error) throw error;
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

    const searchTerm = query.trim().toLowerCase();
    console.log('🔍 Búsqueda avanzada:', searchTerm);
    
    // Obtener todos los vinos activos
    const { data, error } = await supabase
      .from('vinos')
      .select('*')
      .eq('activo', true);

    if (error) {
      console.error('❌ Error en búsqueda avanzada:', error);
      throw error;
    }

    if (!data) return [];

    // Scoring: calcular relevancia de cada vino
    const results = data.map(vino => {
      let score = 0;
      const term = searchTerm;

      // Búsqueda en nombre (peso: 10)
      if (vino.nombre?.toLowerCase().includes(term)) score += 10;
      
      // Búsqueda en bodega (peso: 8)
      if (vino.bodega?.toLowerCase().includes(term)) score += 8;
      
      // Búsqueda en código interno (peso: 7)
      if (vino.codigo_interno?.toLowerCase().includes(term)) score += 7;
      
      // Búsqueda en tipo (peso: 6)
      if (vino.tipo?.toLowerCase().includes(term)) score += 6;
      
      // Búsqueda en variedad uva (peso: 5)
      if (vino.variedad_uva?.toLowerCase().includes(term)) score += 5;
      
      // Búsqueda en región (peso: 4)
      if (vino.region?.toLowerCase().includes(term)) score += 4;
      
      // Búsqueda en denominación origen (peso: 4)
      if (vino.denominacion_origen?.toLowerCase().includes(term)) score += 4;
      
      // Búsqueda en descripción (peso: 3)
      if (vino.descripcion?.toLowerCase().includes(term)) score += 3;
      
      // Búsqueda en notas cata (peso: 3)
      if (vino.notas_cata?.toLowerCase().includes(term)) score += 3;
      
      // Búsqueda en aroma (peso: 2)
      if (vino.aroma?.toLowerCase().includes(term)) score += 2;
      
      // Búsqueda en sabor (peso: 2)
      if (vino.sabor?.toLowerCase().includes(term)) score += 2;
      
      // Búsqueda en maridaje (peso: 2)
      if (vino.maridaje && Array.isArray(vino.maridaje)) {
        const maridajeMatch = vino.maridaje.some((m: string) => 
          m.toLowerCase().includes(term)
        );
        if (maridajeMatch) score += 2;
      }
      
      // Búsqueda en año (exacta)
      if (vino.ano && vino.ano.toString() === term) score += 5;

      return { vino, score };
    })
    .filter(item => item.score > 0) // Solo resultados con coincidencias
    .sort((a, b) => b.score - a.score) // Ordenar por relevancia
    .map(item => item.vino);

    console.log('✅ Resultados por relevancia:', results.length);
    return results as Vino[];
  }
};
