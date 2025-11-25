/**
 * VinIA - Definiciones de tipos TypeScript
 * 
 * Este archivo contiene todas las interfaces y tipos utilizados en la aplicación
 * para garantizar la seguridad de tipos y mejorar la experiencia de desarrollo.
 */

// ============================================
// TIPOS DE VINOS
// ============================================

/**
 * Tipos de vino disponibles
 */
export type TipoVino = 'Tinto' | 'Blanco' | 'Rosado' | 'Espumoso' | 'Fortificado' | 'Dulce';

/**
 * Denominación de origen
 */
export type DO = 
  | 'Rioja' 
  | 'Ribera del Duero' 
  | 'Priorat' 
  | 'Rías Baixas' 
  | 'Jerez' 
  | 'Cava'
  | 'Toro'
  | 'Rueda'
  | 'Navarra'
  | 'Bierzo'
  | 'Tierra de León'
  | 'Cataluña'
  | 'Empordà'
  | 'Provenza'
  | 'Penedès'
  | 'Somontano'
  | 'Lanzarote'
  | 'Manchuela'
  | 'La Mancha'
  | 'Valencia'
  | 'Tokaj'
  | 'Bordeaux'
  | 'Piemonte'
  | 'Véneto'
  | 'Rhône'
  | 'Vino de la Tierra de Castilla y León'
  | 'Vino de Pago Dominio de Valdepusa'
  | 'Cariñena'
  | 'Otras';

/**
 * Interface para un vino
 */
export interface Vino {
  id: string;
  codigo_interno: string;
  codigo_barras?: string | null;
  nombre: string;
  bodega: string;
  region: string;
  denominacion_origen?: string | null;
  pais?: string;
  ano: number | null;
  variedad_uva?: string | null;
  tipo: TipoVino;
  formato_botella?: string;
  grado_alcohol: number;
  precio_unitario: number;
  precio_caja?: number | null;
  unidades_por_caja?: number;
  stock: number;
  stock_minimo?: number;
  imagen_url?: string | null;
  imagen_etiqueta?: string | null;
  descripcion?: string | null;
  notas_cata?: string | null;
  aroma?: string | null;
  sabor?: string | null;
  maridaje?: string[] | null;
  temperatura_servicio?: string | null;
  estado_conservacion?: string;
  potencial_guarda?: string | null;
  anos_guarda_recomendados?: number | null;
  puntuacion_parker?: number | null;
  puntuacion_penin?: number | null;
  puntuacion_guia_proensa?: number | null;
  notas_criticos?: string | null;
  margen_comercial?: number;
  cliente_objetivo?: string;
  promocion_activa?: boolean;
  descuento_promocional?: number;
  texto_promocion?: string | null;
  coste_envio?: number;
  embalaje_especial?: boolean;
  notas_embalaje?: string | null;
  venta_minima_unidades?: number;
  solo_profesionales?: boolean;
  edicion_limitada?: boolean;
  numero_botellas_producidas?: number | null;
  numero_botella?: string | null;
  codigo_lote?: string | null;
  historial_precios?: any;
  valor_estimado_coleccion?: number | null;
  activo: boolean;
  destacado?: boolean;
  created_at?: string;
  updated_at?: string;
  fecha_ultima_actualizacion?: string;
}

// ============================================
// CLIENTES
// ============================================

/**
 * Tipo de cliente
 */
export type TipoCliente = 'Restaurante' | 'Hotel' | 'Tienda' | 'Distribuidor' | 'Particular';

/**
 * Interface para un cliente
 */
export interface Cliente {
  id: string;
  nombre: string;
  cif: string;
  tipo: TipoCliente;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  provincia: string;
  telefono: string;
  email: string;
  personaContacto: string;
  descuento?: number; // Porcentaje de descuento aplicable
  notas?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// PEDIDOS
// ============================================

/**
 * Estado de un pedido
 */
export type EstadoPedido = 'Borrador' | 'Pendiente' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

/**
 * Línea de pedido (detalle de producto en pedido)
 */
export interface LineaPedido {
  id: string;
  vinoId: string;
  vinoNombre?: string; // Nombre del vino para mostrar en listados
  vino?: Vino; // Datos completos del vino para mostrar
  cantidad: number;
  precioUnitario: number;
  descuento: number; // Porcentaje
  subtotal: number;
}

/**
 * Interface para un pedido
 */
export interface Pedido {
  id: string;
  numero: string; // Número de pedido único
  clienteId: string;
  clienteNombre?: string; // Nombre del cliente para mostrar en listados
  cliente?: Cliente; // Datos del cliente para mostrar
  fecha: string;
  estado: EstadoPedido;
  lineas: LineaPedido[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  notas?: string;
  fechaEntrega?: string;
  direccionEntrega?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// FACTURAS
// ============================================

/**
 * Estado de una factura
 */
export type EstadoFactura = 'Pendiente' | 'Pagada' | 'Vencida' | 'Anulada';

/**
 * Método de pago
 */
export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Pagaré' | 'Otros';

/**
 * Interface para una factura
 */
export interface Factura {
  id: string;
  numero: string; // Número de factura único
  pedidoId: string;
  pedido?: Pedido;
  clienteId: string;
  cliente?: Cliente;
  fecha: string;
  fechaVencimiento: string;
  estado: EstadoFactura;
  metodoPago?: MetodoPago;
  subtotal: number;
  iva: number;
  total: number;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * Estadísticas de ventas
 */
export interface EstadisticasVentas {
  periodo: string;
  totalVentas: number;
  totalPedidos: number;
  ticketMedio: number;
  ventasPorTipo: Record<TipoVino, number>;
  topVinos: Array<{ vino: Vino; cantidad: number; total: number }>;
  topClientes: Array<{ cliente: Cliente; total: number; pedidos: number }>;
}

// ============================================
// USUARIO / AUTENTICACIÓN
// ============================================

/**
 * Rol de usuario
 * - Administración: Puede crear vinos, usuarios, clientes y supervisar comerciales
 * - Comercial: Gestiona pedidos y sus clientes asignados
 * - Almacén: Gestiona stock (no implementado aún)
 */
export type RolUsuario = 'Administración' | 'Comercial' | 'Almacén';

/**
 * Interface para un usuario
 */
export interface Usuario {
  id: string;
  username: string; // ID de usuario para login
  nombre: string;
  apellidos: string;
  rol: RolUsuario;
  activo: boolean;
  ultimo_acceso?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Asignación de cliente a comercial
 */
export interface AsignacionCliente {
  id: string;
  cliente_id: string;
  comercial_id: string;
  fecha_asignacion: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Estadísticas de ventas de un comercial
 */
export interface EstadisticasComercial {
  comercial_id: string;
  comercial_nombre: string;
  total_ventas: number;
  num_pedidos: number;
  num_clientes: number;
  ticket_medio: number;
  vinos_mas_vendidos: {
    vino_id: string;
    vino_nombre: string;
    cantidad_vendida: number;
    total_vendido: number;
  }[];
  vinos_menos_vendidos: {
    vino_id: string;
    vino_nombre: string;
    cantidad_vendida: number;
    total_vendido: number;
  }[];
  pedidos_por_estado: {
    estado: EstadoPedido;
    cantidad: number;
  }[];
  ventas_por_mes: {
    mes: string;
    total: number;
  }[];
}

// ============================================
// FILTROS Y BÚSQUEDA
// ============================================

/**
 * Filtros para búsqueda de vinos
 */
export interface FiltrosVino {
  busqueda?: string;
  tipo?: TipoVino[];
  bodega?: string[];
  precioMin?: number;
  precioMax?: number;
  anoMin?: number;
  anoMax?: number;
  denominacionOrigen?: DO[];
  soloDisponibles?: boolean;
}

/**
 * Filtros para búsqueda de pedidos
 */
export interface FiltrosPedido {
  busqueda?: string;
  estado?: EstadoPedido[];
  clienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

/**
 * Filtros para búsqueda de clientes
 */
export interface FiltrosCliente {
  busqueda?: string;
  tipo?: TipoCliente[];
  provincia?: string[];
  soloActivos?: boolean;
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Estado de carga para operaciones asíncronas
 */
export type EstadoCarga = 'idle' | 'loading' | 'success' | 'error';

/**
 * Respuesta genérica de API
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginación
 */
export interface Paginacion {
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
}

/**
 * Respuesta paginada
 */
export interface RespuestaPaginada<T> {
  data: T[];
  paginacion: Paginacion;
}
