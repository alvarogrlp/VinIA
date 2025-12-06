/**
 * VinIA - Pantalla de Pedidos
 * 
 * Listado y gestión de pedidos.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, Filter, Eye } from 'lucide-react';
import { usePedidosStore, useClientesStore } from '../store';
import type { EstadoPedido } from '../types';
import { formatearPrecio } from '../utils/helpers';

export const Pedidos = () => {
  const navigate = useNavigate();
  const { pedidos, cargando, cargarPedidos, cambiarEstadoPedido } = usePedidosStore();
  const { clientes, cargarClientes } = useClientesStore();
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarPedidos();
    cargarClientes();
  }, [cargarPedidos, cargarClientes]);

  // Pedidos con información del cliente
  const pedidosConCliente = useMemo(() => {
    return pedidos.map(pedido => {
      const cliente = clientes.find(c => c.id === pedido.clienteId);
      return {
        ...pedido,
        clienteNombre: cliente?.nombre || 'Cliente no encontrado'
      };
    });
  }, [pedidos, clientes]);

  const getEstadoBadgeClass = (estado: EstadoPedido) => {
    switch (estado) {
      case 'Entregado':
        return 'badge-success';
      case 'Procesando':
      case 'Enviado':
        return 'badge-info';
      case 'Pendiente':
        return 'badge-warning';
      case 'Cancelado':
        return 'badge-error';
      default:
        return 'badge';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Pedidos</h1>
          <p className="mt-2 text-secondary-600">
            Gestiona todos tus pedidos y su estado
          </p>
        </div>
        <button
          onClick={() => navigate('/pedidos/nuevo')}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo pedido
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por número o cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input w-full"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
          <button className="btn-outline">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="card">
        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 rounded-full border-primary-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            {pedidos.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-secondary-600">
                  No hay pedidos registrados
                </p>
                <button
                  onClick={() => navigate('/pedidos/nuevo')}
                  className="mt-4 btn-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear primer pedido
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nº Pedido</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th className="text-right">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosConCliente.map((pedido) => (
                      <tr key={pedido.id}>
                        <td className="font-medium text-secondary-900">
                          {pedido.numero}
                        </td>
                        <td>{pedido.clienteNombre}</td>
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-secondary-500" />
                            {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                          </div>
                        </td>
                        <td>
                          <select
                            value={pedido.estado}
                            onChange={(e) => cambiarEstadoPedido(pedido.id, e.target.value as EstadoPedido)}
                            className={`${getEstadoBadgeClass(pedido.estado)} !px-2 !py-1 text-xs font-medium border-none cursor-pointer`}
                          >
                            <option value="Borrador">Borrador</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmado">Confirmado</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="font-semibold text-right text-secondary-900">
                          {formatearPrecio(pedido.total)}
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              const detalles = pedido.lineas.map(linea =>
                                `- ${linea.vinoNombre}: ${linea.cantidad} uds. x ${formatearPrecio(linea.precioUnitario)} = ${formatearPrecio(linea.subtotal)}`
                              ).join('\n');
                              alert(`Pedido: ${pedido.numero}\nCliente: ${pedido.clienteNombre}\n\nDetalle:\n${detalles}\n\nSubtotal: ${formatearPrecio(pedido.subtotal)}\nIVA (${pedido.iva}%): ${formatearPrecio(pedido.total - pedido.subtotal)}\nTotal: ${formatearPrecio(pedido.total)}`);
                            }}
                            className="btn-outline !py-1 !px-3 text-sm flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
