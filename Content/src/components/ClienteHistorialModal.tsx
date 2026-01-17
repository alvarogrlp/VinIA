import { useState, useEffect } from 'react';
import { X, Search, Calendar, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { pedidosService, type PedidoCompleto } from '../services/pedidos.service';
import { formatearPrecio } from '../utils/helpers';

interface Props {
  cliente: any;
  onClose: () => void;
}

export const ClienteHistorialModal = ({ cliente, onClose }: Props) => {
  const [pedidos, setPedidos] = useState<PedidoCompleto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pedidoExpandido, setPedidoExpandido] = useState<string | null>(null);

  useEffect(() => {
    cargarHistorial();
  }, [cliente.id]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const data = await pedidosService.getByCliente(cliente.id);
      setPedidos(data);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setCargando(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    // Filtro por texto (número de pedido o nombre de vino)
    const textoBusqueda = busqueda.toLowerCase();
    const coincideTexto =
      pedido.numero.toLowerCase().includes(textoBusqueda) ||
      pedido.lineas.some(l => l.vino.nombre.toLowerCase().includes(textoBusqueda));

    // Filtro por fecha
    let coincideFecha = true;
    if (fechaInicio) {
      coincideFecha = coincideFecha && new Date(pedido.fecha) >= new Date(fechaInicio);
    }
    if (fechaFin) {
      // Ajustar fecha fin al final del día
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59);
      coincideFecha = coincideFecha && new Date(pedido.fecha) <= fin;
    }

    return coincideTexto && coincideFecha;
  });

  const toggleExpandir = (id: string) => {
    setPedidoExpandido(pedidoExpandido === id ? null : id);
  };

  const getEstadoClass = (estado: string) => {
    if (estado === 'Entregado') return 'bg-green-100 text-green-700';
    if (estado === 'Pendiente') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const renderContent = () => {
    if (cargando) {
      return (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
        </div>
      );
    }

    if (pedidosFiltrados.length === 0) {
      return (
        <div className="text-center py-12 text-secondary-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
          <p>No se encontraron pedidos con los filtros seleccionados</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {pedidosFiltrados.map(pedido => (
          <div key={pedido.id} className="bg-white border border-secondary-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Cabecera del Pedido */}
            <button
              onClick={() => toggleExpandir(pedido.id)}
              className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-secondary-50 transition-colors outline-none focus:bg-secondary-50 text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${pedidoExpandido === pedido.id ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-500'}`}>
                  {pedidoExpandido === pedido.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-secondary-900">{pedido.numero}</p>
                  <div className="flex items-center gap-2 text-sm text-secondary-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(pedido.fecha).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoClass(pedido.estado)}`}>
                  {pedido.estado}
                </span>
                <div className="text-right">
                  <p className="font-bold text-secondary-900">{formatearPrecio(pedido.total)}</p>
                  <p className="text-xs text-secondary-500">{pedido.lineas.length} items</p>
                </div>
              </div>
            </button>

            {/* Detalles Expandidos */}
            {pedidoExpandido === pedido.id && (
              <div className="border-t border-secondary-100 bg-secondary-50/50 p-4 animate-fade-in">
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Detalle de productos</h4>
                <div className="space-y-2">
                  {pedido.lineas.map(linea => (
                    <div key={linea.id} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-secondary-100">
                      <div>
                        <p className="font-medium text-secondary-900">
                          {linea.vino.nombre}
                          {busqueda && linea.vino.nombre.toLowerCase().includes(busqueda.toLowerCase()) && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Coincidencia</span>
                          )}
                        </p>
                        <p className="text-xs text-secondary-500">{linea.vino.bodega}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-secondary-900">{linea.cantidad} x {formatearPrecio(linea.precioUnitario)}</p>
                        <p className="font-medium text-secondary-900">{formatearPrecio(linea.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-secondary-200 flex justify-end gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-secondary-500">Subtotal: {formatearPrecio(pedido.subtotal)}</p>
                    <p className="text-secondary-500">Descuento: {pedido.descuento}%</p>
                    <p className="text-secondary-500">IVA: {pedido.iva}%</p>
                    <p className="font-bold text-lg text-primary-700 mt-1">Total: {formatearPrecio(pedido.total)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-secondary-900/20 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl h-[85vh] flex flex-col bg-white shadow-xl rounded-xl animate-fade-in"
      >

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">Historial de Pedidos</h2>
            <p className="text-secondary-600">
              Cliente: <span className="font-semibold">{cliente.nombre}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary-100 transition-colors">
            <X className="w-6 h-6 text-secondary-500" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-4 bg-secondary-50 border-b border-secondary-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute w-4 h-4 left-3 top-3 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar pedido o vino..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 input"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-500">Desde:</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="input w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-500">Hasta:</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="flex-1 overflow-y-auto p-4 bg-secondary-50/30">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
