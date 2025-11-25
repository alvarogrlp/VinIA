/**
 * VinIA - Utilidades generales
 * 
 * Funciones helper para usar en toda la aplicación
 */

/**
 * Formatea un número como precio en euros
 */
export const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(precio);
};

/**
 * Formatea una fecha al formato español
 */
export const formatearFecha = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formatea una fecha con hora
 */
export const formatearFechaHora = (fecha: string | Date): string => {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Genera un número de pedido único
 */
export const generarNumeroPedido = (): string => {
  const fecha = new Date();
  const year = fecha.getFullYear().toString().slice(-2);
  const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PED-${year}${month}-${random}`;
};

/**
 * Genera un número de factura único
 */
export const generarNumeroFactura = (): string => {
  const fecha = new Date();
  const year = fecha.getFullYear().toString().slice(-2);
  const month = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FAC-${year}${month}-${random}`;
};

/**
 * Calcula el IVA de un importe
 */
export const calcularIVA = (base: number, porcentaje: number = 21): number => {
  return base * (porcentaje / 100);
};

/**
 * Calcula el total con IVA incluido
 */
export const calcularTotalConIVA = (base: number, porcentaje: number = 21): number => {
  return base + calcularIVA(base, porcentaje);
};

/**
 * Aplica un descuento a un importe
 */
export const aplicarDescuento = (importe: number, descuento: number): number => {
  return importe * (1 - descuento / 100);
};

/**
 * Valida un CIF español
 */
export const validarCIF = (cif: string): boolean => {
  const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/i;
  return cifRegex.test(cif);
};

/**
 * Valida un email
 */
export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Trunca un texto a un número máximo de caracteres
 */
export const truncarTexto = (texto: string, maxLength: number): string => {
  if (texto.length <= maxLength) return texto;
  return texto.slice(0, maxLength) + '...';
};

/**
 * Debounce function para optimizar búsquedas
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait) as unknown as number;
  };
};

/**
 * Genera un ID único simple (para uso en desarrollo)
 */
export const generarId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};
