import { useState, useEffect } from 'react';
import { X, Calendar, ShoppingBag, TrendingUp, Clock, ExternalLink } from 'lucide-react';
import { clientesService } from '../services/clientes.service';
import { formatearPrecio } from '../utils/helpers';
import { ClienteHistorialModal } from './ClienteHistorialModal';

interface Props {
  cliente: any;
  onClose: () => void;
}

export const ClienteDetallesModal = ({ cliente, onClose }: Props) => {
  const [analisis, setAnalisis] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarHistorialCompleto, setMostrarHistorialCompleto] = useState(false);

  useEffect(() => {
    cargarAnalisis();
  }, [cliente.id]);

  const cargarAnalisis = async () => {
    try {
      setCargando(true);
      const data = await clientesService.getAnalisis(cliente.id);
      setAnalisis(data);
    } catch (error) {
      console.error('Error cargando análisis:', error);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoClass = (estado: string) => {
    if (estado === 'Entregado') return 'bg-green-100 text-green-700';
    if (estado === 'Pendiente') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/20 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl h-[90vh] flex flex-col bg-white shadow-xl rounded-xl animate-fade-in overflow-hidden"
        >

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">{cliente.nombre}</h2>
              <p className="text-secondary-600 flex items-center gap-2">
                <span className="font-mono bg-secondary-100 px-2 py-0.5 rounded text-sm">{cliente.cif}</span>
                <span>•</span>
                <span>{cliente.ciudad}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary-100 transition-colors">
              <X className="w-6 h-6 text-secondary-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-secondary-50/50 p-6">
            {cargando ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-secondary-600">Total Gastado</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-900">
                      {formatearPrecio(analisis?.resumen?.total_gastado || 0)}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-secondary-600">Pedidos Totales</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-900">
                      {analisis?.resumen?.num_pedidos || 0}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-secondary-600">Ticket Medio</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary-900">
                      {formatearPrecio(analisis?.resumen?.ticket_medio || 0)}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-secondary-600">Última Compra</span>
                    </div>
                    <p className="text-lg font-bold text-secondary-900">
                      {analisis?.ultima_compra ? new Date(analisis.ultima_compra.fecha).toLocaleDateString() : '-'}
                    </p>
                    {analisis?.ultima_compra && (
                      <p className="text-xs text-secondary-500 mt-1">
                        {formatearPrecio(analisis.ultima_compra.total)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Top Productos */}
                  <div className="lg:col-span-1 bg-white rounded-xl border border-secondary-200 shadow-sm p-5 h-fit">
                    <h3 className="font-bold text-secondary-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary-600" />
                      Top Productos
                    </h3>
                    <div className="space-y-4">
                      {analisis?.top_productos?.length > 0 ? (
                        analisis.top_productos.map((prod: any, idx: number) => (
                          <div key={prod.id || idx} className="flex items-center justify-between border-b border-secondary-100 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-medium text-secondary-900 text-sm">{prod.nombre}</p>
                              <p className="text-xs text-secondary-500">{prod.bodega}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary-700 text-sm">{prod.total_cantidad} uds</p>
                              <p className="text-xs text-secondary-500">{formatearPrecio(prod.total_gastado)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-secondary-500 text-center py-4">Sin datos de productos</p>
                      )}
                    </div>
                  </div>

                  {/* Últimos Pedidos (Resumen) */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-secondary-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-secondary-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-600" />
                        Últimos Pedidos
                      </h3>
                      <button
                        onClick={() => setMostrarHistorialCompleto(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 hover:underline"
                      >
                        Ver historial completo
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-secondary-500 uppercase bg-secondary-50">
                          <tr>
                            <th className="px-4 py-3 rounded-l-lg">Pedido</th>
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right rounded-r-lg">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                          {analisis?.historial?.slice(0, 5).map((pedido: any) => (
                            <tr key={pedido.id} className="hover:bg-secondary-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-secondary-900">{pedido.numero_pedido}</td>
                              <td className="px-4 py-3 text-secondary-600">
                                {new Date(pedido.fecha).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoClass(pedido.estado)}`}>
                                  {pedido.estado}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-secondary-900">
                                {formatearPrecio(pedido.total)}
                              </td>
                            </tr>
                          ))}
                          {(!analisis?.historial || analisis.historial.length === 0) && (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-secondary-500">
                                No hay pedidos registrados
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="bg-white rounded-xl border border-secondary-200 shadow-sm p-5">
                  <h3 className="font-bold text-secondary-900 mb-4">Información de Contacto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-secondary-500 mb-1">Email</p>
                      <p className="font-medium text-secondary-900">{cliente.email || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-secondary-500 mb-1">Teléfono</p>
                      <p className="font-medium text-secondary-900">{cliente.telefono || 'No disponible'}</p>
                    </div>
                    <div>
                      <p className="text-secondary-500 mb-1">Dirección</p>
                      <p className="font-medium text-secondary-900">
                        {cliente.direccion}, {cliente.ciudad} ({cliente.codigoPostal})
                      </p>
                    </div>
                    {cliente.notas && (
                      <div className="md:col-span-3 mt-2 pt-4 border-t border-secondary-100">
                        <p className="text-secondary-500 mb-1">Notas</p>
                        <p className="text-secondary-700 italic">{cliente.notas}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Historial Completo */}
      {mostrarHistorialCompleto && (
        <ClienteHistorialModal
          cliente={cliente}
          onClose={() => setMostrarHistorialCompleto(false)}
        />
      )}
    </>
  );
};
