/**
 * Modal para asignar clientes a un comercial
 */

import { useState, useEffect } from 'react';
import { X, Search, Plus, Trash2 } from 'lucide-react';
import { useClientesStore, useAuthStore } from '../store';
import { asignacionesService, type ClienteAsignado } from '../services/asignaciones.service';

interface Props {
  comercial: {
    id: string;
    nombre: string;
    apellidos: string | null;
  };
  onClose: () => void;
}

export const AsignacionClientesModal = ({ comercial, onClose }: Props) => {
  const { clientes, cargarClientes } = useClientesStore();
  const { usuario } = useAuthStore();
  const [asignados, setAsignados] = useState<ClienteAsignado[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [comercial.id]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      await cargarClientes();
      const clientesAsignados = await asignacionesService.getClientesComercial(comercial.id);
      setAsignados(clientesAsignados);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleAsignar = async (clienteId: string) => {
    if (!usuario?.id) return;

    try {
      setProcesando(true);
      await asignacionesService.asignarCliente(clienteId, comercial.id, usuario.id);
      // Recargar lista de asignados
      const actualizados = await asignacionesService.getClientesComercial(comercial.id);
      setAsignados(actualizados);
    } catch (error: any) {
      console.error('Error al asignar cliente:', error);
      alert(`Error al asignar cliente: ${error.message || 'Error desconocido'}`);
    } finally {
      setProcesando(false);
    }
  };

  const handleDesasignar = async (clienteId: string) => {
    try {
      setProcesando(true);
      await asignacionesService.desasignarCliente(clienteId, comercial.id);
      // Recargar lista de asignados
      const actualizados = await asignacionesService.getClientesComercial(comercial.id);
      setAsignados(actualizados);
    } catch (error) {
      console.error('Error al desasignar cliente:', error);
      alert('Error al desasignar cliente');
    } finally {
      setProcesando(false);
    }
  };

  // Filtrar clientes disponibles (no asignados a este comercial)
  const clientesDisponibles = clientes.filter(cliente => {
    const estaAsignado = asignados.some(a => a.cliente_id === cliente.id);
    const coincideBusqueda =
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.cif.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.ciudad.toLowerCase().includes(busqueda.toLowerCase());

    return !estaAsignado && coincideBusqueda;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/20 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[80vh] flex flex-col bg-white shadow-xl rounded-xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">
              Asignar Clientes
            </h2>
            <p className="text-secondary-600">
              Comercial: <span className="font-semibold">{comercial.nombre} {comercial.apellidos}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Panel Izquierdo: Clientes Disponibles */}
          <div className="flex flex-col w-1/2 border-r border-secondary-200">
            <div className="p-4 border-b border-secondary-200 bg-secondary-50">
              <h3 className="mb-3 font-semibold text-secondary-900">Clientes Disponibles</h3>
              <div className="relative">
                <Search className="absolute w-4 h-4 left-3 top-3 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full input"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {cargando ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
                </div>
              ) : clientesDisponibles.length === 0 ? (
                <p className="text-center text-secondary-500 py-8">
                  No se encontraron clientes disponibles
                </p>
              ) : (
                <div className="space-y-2">
                  {clientesDisponibles.map(cliente => (
                    <div key={cliente.id} className="flex items-center justify-between p-3 bg-white border rounded-lg border-secondary-200 hover:border-primary-300 transition-colors">
                      <div>
                        <p className="font-medium text-secondary-900">{cliente.nombre}</p>
                        <p className="text-xs text-secondary-500">{cliente.ciudad} • {cliente.tipo}</p>
                      </div>
                      <button
                        onClick={() => handleAsignar(cliente.id)}
                        disabled={procesando}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Asignar cliente"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel Derecho: Clientes Asignados */}
          <div className="flex flex-col w-1/2 bg-secondary-50/50">
            <div className="p-4 border-b border-secondary-200 bg-secondary-50">
              <h3 className="font-semibold text-secondary-900">
                Clientes Asignados ({asignados.length})
              </h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {cargando ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
                </div>
              ) : asignados.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-secondary-500">
                  <p>No hay clientes asignados</p>
                  <p className="text-sm">Selecciona clientes del panel izquierdo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {asignados.map(asignacion => (
                    <div key={asignacion.cliente_id} className="flex items-center justify-between p-3 bg-white border rounded-lg border-secondary-200 shadow-sm">
                      <div>
                        <p className="font-medium text-secondary-900">{asignacion.cliente_nombre}</p>
                        <p className="text-xs text-secondary-500">
                          Asignado: {new Date(asignacion.fecha_asignacion).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDesasignar(asignacion.cliente_id)}
                        disabled={procesando}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Desasignar cliente"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-secondary-200 bg-secondary-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};
