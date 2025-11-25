/**
 * VinIA - Pantalla de Facturas
 * 
 * Listado de facturas generadas a partir de pedidos entregados.
 * Permite visualizar y descargar facturas.
 */

import { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react';
import { usePedidosStore } from '../store';
import { formatearPrecio, formatearFecha } from '../utils/helpers';

export const Facturas = () => {
  const { pedidos, cargarPedidos, cargando } = usePedidosStore();
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // Filtrar solo pedidos entregados (que consideramos facturados)
  const facturas = pedidos
    .filter(p => p.estado === 'Entregado')
    .filter(p => 
      p.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.clienteNombre || '').toLowerCase().includes(busqueda.toLowerCase())
    );

  const handleDescargar = (id: string) => {
    alert(`Descargando factura ${id}... (Funcionalidad simulada)`);
  };

  const renderTableBody = () => {
    if (cargando) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-8 text-center text-secondary-500">
            Cargando facturas...
          </td>
        </tr>
      );
    }

    if (facturas.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-8 text-center text-secondary-500">
            No se encontraron facturas
          </td>
        </tr>
      );
    }

    return facturas.map((factura) => (
      <tr key={factura.id} className="hover:bg-secondary-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-700">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-medium text-secondary-900">
              {factura.numero.replace('PED', 'FAC')}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="font-medium text-secondary-900">{factura.clienteNombre}</div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-secondary-600">
            <Calendar className="w-4 h-4" />
            {formatearFecha(factura.fecha)}
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 font-medium text-secondary-900">
            <DollarSign className="w-4 h-4 text-secondary-400" />
            {formatearPrecio(factura.total)}
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button 
              className="p-2 text-secondary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleDescargar(factura.numero)}
              className="p-2 text-secondary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              title="Descargar PDF"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Facturas</h1>
          <p className="text-secondary-600">Gestión y descarga de facturas de pedidos entregados</p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="p-4 bg-white border shadow-sm rounded-xl border-secondary-200">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-secondary-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 input"
          />
        </div>
      </div>

      {/* Lista de Facturas */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-secondary-900">Nº Factura</th>
                <th className="px-6 py-4 font-semibold text-secondary-900">Cliente</th>
                <th className="px-6 py-4 font-semibold text-secondary-900">Fecha Emisión</th>
                <th className="px-6 py-4 font-semibold text-secondary-900">Importe</th>
                <th className="px-6 py-4 font-semibold text-secondary-900 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
