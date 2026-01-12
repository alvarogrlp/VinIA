/**
 * VinIA - Gestión de Pedidos (ERP Dashboard)
 * 
 * Dashboard centralizado para la gestión del ciclo de vida de los pedidos.
 * Filtra y muestra acciones según el rol del usuario (Comercial, Admin, Almacén, Repartidor).
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Eye,
  Truck, Package, FileText, AlertTriangle
} from 'lucide-react';
import { usePedidosStore, useClientesStore, useAuthStore } from '../store';
import { PedidoModal } from '../components/PedidoModal';
import { VistaAlmacen } from '../components/VistaAlmacen';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatearPrecio } from '../utils/helpers';
import type { Pedido, EstadoPedido } from '../types';

export const Pedidos = () => {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const esCancelable = (estado: string) => {
    if (!estado) return false;
    const s = estado.toUpperCase().replace(/_/g, ' ').replace(/Á/g, 'A').replace(/Ó/g, 'O').trim();
    return ['PENDIENTE VALIDACION', 'PENDIENTE', 'BORRADOR', 'PENDIENTE DE VALIDACION'].includes(s);
  };

  if (usuario?.rol === 'Almacén') {
    return (
      <div className="animate-fade-in pb-20">
        <VistaAlmacen />
      </div>
    );
  }

  const { pedidos, cargarPedidos, cambiarEstadoPedido } = usePedidosStore();
  const { clientes, cargarClientes } = useClientesStore();

  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState<string>('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  useEffect(() => {
    cargarPedidos();
    cargarClientes();
  }, [cargarPedidos, cargarClientes]);

  // Determinar tabs disponibles según rol
  const tabs = useMemo(() => {
    const role = usuario?.rol;
    const common = [{ id: 'todos', label: 'Todos', icon: FileText }];

    if (role === 'Administración') {
      return [
        { id: 'validacion', label: 'Validación', icon: AlertTriangle }, // Pendiente Validación
        { id: 'facturacion', label: 'Facturación', icon: FileText }, // Entregado -> Facturado
        ...common
      ];
    }
    if (role === 'Almacén') {
      return [
        { id: 'picking', label: 'Preparación', icon: Package }, // En Preparación
        { id: 'envios', label: 'Envíos', icon: Truck }, // En Reparto (View only)
        ...common
      ];
    }
    if (role === 'Comercial') {
      return [
        { id: 'mis_pedidos', label: 'Mis Pedidos', icon: FileText },
        ...common
      ];
    }
    // Repartidor (role text might differ physically, distinct specific logic?)
    if (role === 'Repartidor' || (usuario?.username === 'repartidor')) {
      return [
        { id: 'reparto', label: 'Mi Reparto', icon: Truck }, // En Reparto
        ...common
      ];
    }
    return common;
  }, [usuario]);

  useEffect(() => {
    if (tabs.length > 0 && tabActiva === 'todos' && tabs[0].id !== 'todos') {
      setTabActiva(tabs[0].id);
    }
  }, [tabs]);

  // Filtrado de pedidos
  const pedidosFiltrados = useMemo(() => {
    let filtered = pedidos.map(p => ({
      ...p,
      clienteNombre: clientes.find(c => c.id === p.clienteId)?.nombre || 'Cliente Desconocido',
      cliente: clientes.find(c => c.id === p.clienteId)
    }));

    // Filtro por Tab
    if (tabActiva === 'validacion') {
      filtered = filtered.filter(p => p.estado === 'Pendiente de Validación' || p.estado === 'PENDIENTE_VALIDACION' || p.estado === 'Pendiente' || p.estado === 'PENDIENTE');
    } else if (tabActiva === 'picking') {
      filtered = filtered.filter(p => p.estado === 'En Preparación');
    } else if (tabActiva === 'reparto') {
      filtered = filtered.filter(p => p.estado === 'En Reparto');
    } else if (tabActiva === 'facturacion') {
      filtered = filtered.filter(p => p.estado === 'Entregado');
    } else if (tabActiva === 'envios') {
      filtered = filtered.filter(p => p.estado === 'En Reparto');
    } else if (tabActiva === 'mis_pedidos') {
      // Filter by comercial logic if needed, currently showing all for demo
    }

    // Filtro por Busqueda
    if (busqueda) {
      const term = busqueda.toLowerCase();
      filtered = filtered.filter(p =>
        p.numero.toLowerCase().includes(term) ||
        p.clienteNombre.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at || b.fecha).getTime() - new Date(a.created_at || a.fecha).getTime());
  }, [pedidos, clientes, tabActiva, busqueda]);


  // Acciones
  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const handleAprobar = async (id: string) => {
    showConfirm('Aprobar Pedido', '¿Aprobar pedido y liberar riesgo?', async () => {
      await cambiarEstadoPedido(id, 'En Preparación');
      cargarPedidos(); // Refresh to update risk/state
    });
  };

  const handlePreparado = async (id: string) => {
    showConfirm('Confirmar Preparación', '¿Marcar como preparado y descontar stock?', async () => {
      try {
        await cambiarEstadoPedido(id, 'En Reparto');
        cargarPedidos();
      } catch (e: any) {
        console.error('Error: ' + e.message);
      }
    });
  };

  const handleCancelar = (id: string) => {
    showConfirm('Cancelar Pedido', '¿Está seguro de que desea cancelar este pedido? Se devolverá el stock.', async () => {
      try {
        await cambiarEstadoPedido(id, 'CANCELADO');
        cargarPedidos();
      } catch (e) { console.error(e); }
    });
  };

  const handleEntregar = async (id: string) => {
    const firma = prompt('Firma del cliente (simulada):', 'Recibido conforme');
    if (firma) {
      await cambiarEstadoPedido(id, 'Entregado');
      // TODO: Send signature to backend via separate endpoint if implemented
      alert('Pedido entregado.');
    }
  };

  const handleVerDetalles = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
  };

  const handleCambiarEstadoDesdeModal = async (id: string, nuevoEstado: EstadoPedido) => {
    try {
      await cambiarEstadoPedido(id, nuevoEstado);
      cargarPedidos();
      // Update local state to reflect change immediately in modal if open, though closeModal refreshes list
      // simpler to just close or re-fetch.
    } catch (e: any) {
      alert('Error al actualizar estado: ' + e.message);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const styles: Record<string, string> = {
      'Borrador': 'bg-gray-100 text-gray-800',
      'Pendiente': 'bg-yellow-100 text-yellow-800',
      'PENDIENTE_VALIDACION': 'bg-red-100 text-red-800', // ENUM raw value
      'Pendiente de Validación': 'bg-red-100 text-red-800', // Potential Display value
      'En Preparación': 'bg-blue-100 text-blue-800',
      'EN_PREPARACION': 'bg-blue-100 text-blue-800',
      'En Reparto': 'bg-purple-100 text-purple-800',
      'EN_REPARTO': 'bg-purple-100 text-purple-800',
      'Entregado': 'bg-green-100 text-green-800',
      'ENTREGADO': 'bg-green-100 text-green-800',
      'Facturado': 'bg-green-800 text-white',
    };

    // Normalize state string
    const normalized = estado.replace(/_/g, ' ');
    const style = styles[estado] || styles[normalized] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style}`}>
        {estado.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Gestión de Pedidos</h1>
          <p className="mt-2 text-secondary-600">
            Ciclo de vida de pedidos: {usuario?.rol}
          </p>
        </div>
        {usuario?.rol === 'Comercial' && (
          <button
            onClick={() => navigate('/pedidos/nuevo')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo pedido
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-secondary-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${tabActiva === tab.id
                ? 'border-primary-600 text-primary-700 font-medium'
                : 'border-transparent text-secondary-500 hover:text-secondary-700'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o número de pedido..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input w-full"
            style={{ paddingLeft: '3rem' }}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="card overflow-hidden">
        <table className="table w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="p-4 text-left">Pedido</th>
              <th className="p-4 text-left">Cliente</th>
              <th className="p-4 text-left">Fecha</th>
              <th className="p-4 text-left">Forma Pago</th>
              <th className="p-4 text-left">Estado</th>
              {usuario?.rol !== 'Comercial' && <th className="p-4 text-left">Comercial</th>}
              <th className="p-4 text-right">Total</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {pedidosFiltrados.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-primary-50 transition-colors">
                <td className="p-4 font-medium">{pedido.numero}</td>
                <td className="p-4">
                  <div className="font-medium text-secondary-900">{pedido.clienteNombre}</div>
                  <div className="text-xs text-secondary-500">CIF: {pedido.cliente?.cif}</div>
                </td>
                <td className="p-4 text-sm text-secondary-600">
                  {new Date(pedido.fecha).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm">
                  {pedido.formaPago || 'Contado'}
                </td>
                <td className="p-4">
                  {getEstadoBadge(pedido.estado)}
                </td>
                {usuario?.rol !== 'Comercial' && (
                  <td className="p-4 text-sm text-secondary-600">
                    {pedido.usuario?.nombre ? `${pedido.usuario.nombre} ${pedido.usuario.apellidos}` : '-'}
                  </td>
                )}
                <td className="p-4 text-right font-bold text-secondary-900">
                  {formatearPrecio(pedido.total)}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2 items-center">
                    {/* Cancel Action for Commercial & Admin */}
                    {(usuario?.rol === 'Comercial' || usuario?.rol === 'Administración') && esCancelable(pedido.estado) && (
                      <button
                        onClick={() => handleCancelar(pedido.id)}
                        className="px-3 py-1 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-700 transition-all shadow-sm"
                      >
                        CANCELAR
                      </button>
                    )}

                    {/* Validation Actions */}
                    {tabActiva === 'validacion' && (pedido.estado === 'PENDIENTE_VALIDACION' || pedido.estado === 'Pendiente de Validación') && (
                      <button onClick={() => handleAprobar(pedido.id)} className="btn-primary py-1 px-3 text-xs bg-green-600 hover:bg-green-700">
                        Aprobar
                      </button>
                    )}

                    {/* Picking Actions */}
                    {tabActiva === 'picking' && (pedido.estado === 'EN_PREPARACION' || pedido.estado === 'En Preparación') && (
                      <button onClick={() => handlePreparado(pedido.id)} className="btn-primary py-1 px-3 text-xs">
                        Preparado
                      </button>
                    )}

                    {/* Delivery Actions */}
                    {(tabActiva === 'reparto' || tabActiva === 'envios') && (pedido.estado === 'EN_REPARTO' || pedido.estado === 'En Reparto') && usuario?.rol !== 'Almacén' && (
                      <button onClick={() => handleEntregar(pedido.id)} className="btn-primary py-1 px-3 text-xs bg-purple-600 hover:bg-purple-700">
                        Entregar
                      </button>
                    )}

                    {/* Details (Always visible) */}
                    <button
                      onClick={() => handleVerDetalles(pedido)}
                      className="p-2 text-secondary-400 hover:text-primary-600 transition-colors"
                      title="Ver detalles completos"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pedidosFiltrados.length === 0 && (
          <div className="p-8 text-center text-secondary-500">
            No hay pedidos en esta sección.
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {pedidoSeleccionado && (
        <PedidoModal
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
          onCambiarEstado={handleCambiarEstadoDesdeModal}
          rol={usuario?.rol}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
};
