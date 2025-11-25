/**
 * VinIA - Componente de Tarjeta de Vino
 * 
 * Muestra información resumida de un vino en formato tarjeta.
 * Incluye imagen, datos básicos, precio y stock.
 */

import { Wine, Package } from 'lucide-react';
import type { Vino } from '../types';

interface VinoCardProps {
  vino: Vino;
  onClick?: () => void;
}

export const VinoCard = ({ vino, onClick }: VinoCardProps) => {
  // Determinar el color del badge según el tipo de vino
  const getTipoBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'Tinto':
        return 'bg-red-100 text-red-800';
      case 'Blanco':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rosado':
        return 'bg-pink-100 text-pink-800';
      case 'Espumoso':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
  };

  // Determinar color del stock
  const getStockClass = () => {
    if (vino.stock === 0) return 'text-red-600';
    if (vino.stock < (vino.stock_minimo || 10)) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className="card group cursor-pointer"
    >
      {/* Imagen del vino */}
      <div className="relative mb-4 overflow-hidden rounded-lg aspect-[3/4] bg-secondary-100">
        {vino.imagen_url ? (
          <img
            src={vino.imagen_url}
            alt={vino.nombre}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Wine className="w-16 h-16 text-secondary-300" />
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className={`absolute top-3 left-3 badge ${getTipoBadgeClass(vino.tipo)}`}>
          {vino.tipo}
        </div>
        
        {/* Indicador de stock bajo */}
        {vino.stock < (vino.stock_minimo || 10) && vino.stock > 0 && (
          <div className="absolute px-2 py-1 text-xs font-medium text-white bg-yellow-500 rounded-full top-3 right-3">
            Stock bajo
          </div>
        )}
        {vino.stock === 0 && (
          <div className="absolute px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full top-3 right-3">
            Agotado
          </div>
        )}
      </div>

      {/* Información del vino */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-secondary-900 line-clamp-1">
          {vino.nombre}
        </h3>
        
        <p className="text-sm text-secondary-600 line-clamp-1">
          {vino.bodega}
        </p>

        <div className="flex items-center gap-2 text-xs text-secondary-600">
          <span>{vino.denominacion_origen || 'Sin D.O.'}</span>
          <span>•</span>
          <span>{vino.ano || 'S/A'}</span>
          <span>•</span>
          <span>{vino.grado_alcohol}% vol.</span>
        </div>

        {/* Precio y stock */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-secondary-200">
          <div>
            <p className="text-2xl font-bold text-primary-600">
              €{vino.precio_unitario.toFixed(2)}
            </p>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <Package className={`w-4 h-4 ${getStockClass()}`} />
            <span className={`font-medium ${getStockClass()}`}>
              {vino.stock} uds.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
