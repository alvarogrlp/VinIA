/**
 * Cliente de Supabase
 * 
 * Configuración del cliente para conectar con la base de datos
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan las credenciales de Supabase. Verifica tu archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScript basados en la base de datos
// Type aliases para simplificar tipos union
type ClienteOmitKeys = 'id' | 'created_at' | 'updated_at';
type VinoOmitKeys = 'id' | 'created_at' | 'updated_at' | 'fecha_ultima_actualizacion';

export interface Database {
  public: {
    Tables: {
      vinos: {
        Row: {
          id: string;
          codigo_interno: string;
          codigo_barras: string | null;
          nombre: string;
          bodega: string;
          region: string;
          denominacion_origen: string | null;
          pais: string;
          ano: number | null;
          variedad_uva: string | null;
          tipo: 'Tinto' | 'Blanco' | 'Rosado' | 'Espumoso' | 'Fortificado' | 'Dulce';
          formato_botella: string;
          grado_alcohol: number;
          precio_unitario: number;
          precio_caja: number | null;
          unidades_por_caja: number;
          stock: number;
          stock_minimo: number;
          imagen_url: string | null;
          imagen_etiqueta: string | null;
          descripcion: string | null;
          notas_cata: string | null;
          aroma: string | null;
          sabor: string | null;
          maridaje: string[] | null;
          temperatura_servicio: string | null;
          estado_conservacion: string;
          potencial_guarda: string | null;
          anos_guarda_recomendados: number | null;
          puntuacion_parker: number | null;
          puntuacion_penin: number | null;
          puntuacion_guia_proensa: number | null;
          notas_criticos: string | null;
          margen_comercial: number;
          cliente_objetivo: string;
          promocion_activa: boolean;
          descuento_promocional: number;
          texto_promocion: string | null;
          coste_envio: number;
          embalaje_especial: boolean;
          notas_embalaje: string | null;
          venta_minima_unidades: number;
          solo_profesionales: boolean;
          edicion_limitada: boolean;
          numero_botellas_producidas: number | null;
          numero_botella: string | null;
          codigo_lote: string | null;
          historial_precios: any;
          valor_estimado_coleccion: number | null;
          activo: boolean;
          destacado: boolean;
          created_at: string;
          updated_at: string;
          fecha_ultima_actualizacion: string;
        };
        Insert: Omit<Database['public']['Tables']['vinos']['Row'], VinoOmitKeys>;
        Update: Partial<Database['public']['Tables']['vinos']['Insert']>;
      };
      clientes: {
        Row: {
          id: string;
          nombre: string;
          cif: string;
          email: string | null;
          telefono: string | null;
          direccion: string | null;
          ciudad: string | null;
          codigo_postal: string | null;
          tipo: 'Restaurante' | 'Hotel' | 'Tienda' | 'Distribuidor' | 'Particular' | 'Otro' | null;
          descuento_habitual: number;
          activo: boolean;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clientes']['Row'], ClienteOmitKeys>;
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>;
      };
      pedidos: {
        Row: {
          id: string;
          numero_pedido: string;
          cliente_id: string;
          fecha: string;
          estado: 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
          subtotal: number;
          descuento: number;
          iva: number;
          total: number;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pedidos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['pedidos']['Insert']>;
      };
      lineas_pedido: {
        Row: {
          id: string;
          pedido_id: string;
          vino_id: string;
          cantidad: number;
          precio_unitario: number;
          descuento: number;
          subtotal: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['lineas_pedido']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['lineas_pedido']['Insert']>;
      };
      facturas: {
        Row: {
          id: string;
          numero_factura: string;
          pedido_id: string;
          cliente_id: string;
          fecha: string;
          fecha_vencimiento: string | null;
          subtotal: number;
          descuento: number;
          iva: number;
          total: number;
          estado: 'Pendiente' | 'Pagada' | 'Vencida' | 'Cancelada';
          metodo_pago: string | null;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['facturas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['facturas']['Insert']>;
      };
    };
  };
}
