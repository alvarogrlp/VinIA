/**
 * VinIA - Pantalla de Inventario
 * 
 * Gestión de stock para el perfil de Almacén.
 * Permite ver niveles de stock, filtrar por bajo stock y actualizar cantidades.
 */

import { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, Save, RefreshCw, Plus, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVinosStore, useAuthStore } from '../store';

export const Inventario = () => {
  const navigate = useNavigate();
  const { vinos, cargando, cargarVinos, actualizarStock } = useVinosStore();
  const { usuario } = useAuthStore();
  const [busqueda, setBusqueda] = useState('');
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [stockEditado, setStockEditado] = useState<Record<string, number>>({});
  const [guardando, setGuardando] = useState<Record<string, boolean>>({});

  useEffect(() => {
    cargarVinos();
  }, [cargarVinos]);

  // Filtrar vinos
  const vinosFiltrados = vinos.filter(vino => {
    const cumpleBusqueda =
      vino.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      vino.bodega.toLowerCase().includes(busqueda.toLowerCase()) ||
      vino.codigo_interno.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleStock = soloBajoStock ? vino.stock <= (vino.stock_minimo || 0) : true;

    return cumpleBusqueda && cumpleStock;
  });

  const handleStockChange = (id: string, valor: string) => {
    const cantidad = Number.parseInt(valor, 10);
    if (!Number.isNaN(cantidad) && cantidad >= 0) {
      setStockEditado(prev => ({ ...prev, [id]: cantidad }));
    }
  };

  const guardarStock = async (id: string) => {
    const nuevoStock = stockEditado[id];
    if (nuevoStock === undefined) return;

    try {
      setGuardando(prev => ({ ...prev, [id]: true }));
      await actualizarStock(id, nuevoStock);

      // Limpiar estado de edición para este item
      setStockEditado(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error('Error actualizando stock:', error);
      alert('Error al actualizar el stock');
    } finally {
      setGuardando(prev => ({ ...prev, [id]: false }));
    }
  };

  if (usuario?.rol !== 'Almacén' && usuario?.rol !== 'Administración') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
          <h2 className="text-2xl font-bold text-secondary-900">Acceso Restringido</h2>
          <p className="mt-2 text-secondary-600">
            Esta sección es exclusiva para personal de almacén.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Gestión de Inventario</h1>
          <p className="mt-2 text-secondary-600">
            Control y actualización de stock en tiempo real
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => navigate('/inventario/nuevo')}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Vino
        </button>
        <button
          onClick={() => cargarVinos()}
          className="btn-outline"
          title="Recargar datos"
        >
          <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
        </button>
      </div>


      {/* Filtros y Métricas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Buscador */}
        <div className="md:col-span-2 card !p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, bodega o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full input"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
          <button
            onClick={() => setSoloBajoStock(!soloBajoStock)}
            className={`btn-outline ${soloBajoStock ? 'bg-red-50 border-red-200 text-red-700' : ''}`}
          >
            <AlertTriangle className={`w-5 h-5 mr-2 ${soloBajoStock ? 'text-red-500' : 'text-secondary-400'}`} />
            Bajo Stock
          </button>
        </div>

        {/* Resumen */}
        <div className="card !p-4 flex items-center justify-between bg-primary-50 border-primary-100">
          <div>
            <p className="text-sm font-medium text-primary-800">Total Referencias</p>
            <p className="text-2xl font-bold text-primary-900">{vinos.length}</p>
          </div>
          <div className="h-10 w-px bg-primary-200 mx-4"></div>
          <div>
            <p className="text-sm font-medium text-red-800">Bajo Stock</p>
            <p className="text-2xl font-bold text-red-900">
              {vinos.filter(v => v.stock <= (v.stock_minimo || 0)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="card">
        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 rounded-full border-primary-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Código</th>
                  <th>Ubicación</th>
                  <th className="text-center">Stock Mínimo</th>
                  <th className="text-center">Stock Actual</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vinosFiltrados.map((vino) => {
                  const isLowStock = vino.stock <= (vino.stock_minimo || 0);
                  const isEditing = stockEditado[vino.id] !== undefined;
                  const currentStock = isEditing ? stockEditado[vino.id] : vino.stock;
                  const hasChanges = isEditing && stockEditado[vino.id] !== vino.stock;

                  return (
                    <tr key={vino.id} className={isLowStock ? 'bg-red-50/30' : ''}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded bg-secondary-100">
                            {vino.imagen_url ? (
                              <img src={vino.imagen_url} alt={vino.nombre} className="object-cover w-full h-full" />
                            ) : (
                              <Package className="w-full h-full p-2 text-secondary-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">{vino.nombre}</p>
                            <p className="text-sm text-secondary-500">{vino.bodega}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-sm text-secondary-600">
                        {vino.codigo_interno}
                      </td>
                      <td className="text-sm text-secondary-600">
                        Pasillo A-12 {/* Placeholder para ubicación real si existiera */}
                      </td>
                      <td className="text-center text-secondary-600">
                        {vino.stock_minimo}
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => handleStockChange(vino.id, e.target.value)}
                            className={`w-20 text-center input py-1 ${isLowStock ? 'border-red-300 text-red-700 bg-red-50' : ''
                              } ${hasChanges ? 'border-primary-500 ring-1 ring-primary-500' : ''}`}
                          />
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <button
                            onClick={() => navigate(`/inventario/editar/${vino.id}`)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Editar vino"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {hasChanges && (
                            <button
                              onClick={() => guardarStock(vino.id)}
                              disabled={guardando[vino.id]}
                              className="btn-primary !py-1 !px-3 text-sm inline-flex items-center gap-1"
                            >
                              {guardando[vino.id] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              Guardar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {vinosFiltrados.length === 0 && (
              <div className="py-12 text-center text-secondary-500">
                No se encontraron productos que coincidan con los filtros.
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
};
