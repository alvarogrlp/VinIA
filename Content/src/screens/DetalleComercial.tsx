/**
 * VinIA - Detalle de Comercial
 * 
 * Vista detallada de estadísticas y rendimiento de un comercial específico.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  ShoppingCart,
  Euro,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../store';
import { administracionService } from '../services/administracion.service';
import type { EstadisticasComercial } from '../types';
import { formatearPrecio } from '../utils/helpers';

export const DetalleComercial = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [estadisticas, setEstadisticas] = useState<EstadisticasComercial | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (id && usuario?.rol === 'Administración') {
      cargarDatos();
    }
  }, [id, usuario?.rol]);

  // Verificar permisos
  if (usuario?.rol !== 'Administración') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
          <h2 className="text-2xl font-bold text-secondary-900">Acceso denegado</h2>
          <p className="mt-2 text-secondary-600">
            Solo los usuarios con rol Administración pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  const cargarDatos = async () => {
    if (!id) return;
    
    try {
      setCargando(true);
      const [stats, clientesData] = await Promise.all([
        administracionService.obtenerEstadisticasComercial(id),
        administracionService.obtenerClientesComercial(id)
      ]);
      
      setEstadisticas(stats);
      setClientes(clientesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-primary-600 border-t-transparent animate-spin"></div>
          <p className="text-secondary-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
          <p className="text-secondary-600">No se encontraron datos del comercial</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/administracion')}
          className="flex items-center gap-2 mb-4 text-secondary-600 hover:text-secondary-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a administración
        </button>
        <h1 className="text-3xl font-bold text-secondary-900">
          {estadisticas.comercial_nombre}
        </h1>
        <p className="mt-2 text-secondary-600">
          Estadísticas detalladas y rendimiento
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Ventas totales</p>
              <p className="mt-2 text-3xl font-bold text-secondary-900">
                {formatearPrecio(estadisticas.total_ventas)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Pedidos realizados</p>
              <p className="mt-2 text-3xl font-bold text-secondary-900">
                {estadisticas.num_pedidos}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-primary-100">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Clientes asignados</p>
              <p className="mt-2 text-3xl font-bold text-secondary-900">
                {estadisticas.num_clientes}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Ticket medio</p>
              <p className="mt-2 text-3xl font-bold text-secondary-900">
                {formatearPrecio(estadisticas.ticket_medio)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Vinos más y menos vendidos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vinos más vendidos */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-green-100">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900">
              Vinos más vendidos
            </h2>
          </div>

          {estadisticas.vinos_mas_vendidos.length === 0 ? (
            <p className="py-8 text-center text-secondary-500">
              No hay datos de ventas aún
            </p>
          ) : (
            <div className="space-y-4">
              {estadisticas.vinos_mas_vendidos.map((vino, index) => (
                <div key={vino.vino_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full bg-green-100 text-green-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-secondary-900">{vino.vino_nombre}</p>
                      <p className="text-sm text-secondary-600">
                        {vino.cantidad_vendida} botellas
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-secondary-900">
                    {formatearPrecio(vino.total_vendido)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vinos menos vendidos */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-red-100">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-secondary-900">
              Vinos menos vendidos
            </h2>
          </div>

          {estadisticas.vinos_menos_vendidos.length === 0 ? (
            <p className="py-8 text-center text-secondary-500">
              No hay datos de ventas aún
            </p>
          ) : (
            <div className="space-y-4">
              {estadisticas.vinos_menos_vendidos.map((vino, index) => (
                <div key={vino.vino_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary-50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full bg-red-100 text-red-600">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-secondary-900">{vino.vino_nombre}</p>
                      <p className="text-sm text-secondary-600">
                        {vino.cantidad_vendida} botellas
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-secondary-900">
                    {formatearPrecio(vino.total_vendido)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clientes asignados */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            Clientes asignados
          </h2>
          <Link
            to="/administracion/asignaciones"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Gestionar asignaciones
          </Link>
        </div>

        {clientes.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <p className="text-secondary-600">No tiene clientes asignados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Fecha asignación</th>
                  <th className="text-right">Pedidos</th>
                  <th className="text-right">Total comprado</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.cliente_id}>
                    <td>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {cliente.cliente_nombre}
                        </p>
                        <p className="text-sm text-secondary-500">
                          {cliente.cliente_cif}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="badge-info">
                        {cliente.cliente_tipo || 'Particular'}
                      </span>
                    </td>
                    <td className="text-secondary-600">
                      {new Date(cliente.fecha_asignacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="text-right font-medium text-secondary-900">
                      {cliente.num_pedidos || 0}
                    </td>
                    <td className="text-right font-semibold text-secondary-900">
                      {formatearPrecio(cliente.total_comprado || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pedidos por estado */}
      <div className="card">
        <h2 className="mb-6 text-xl font-semibold text-secondary-900">
          Pedidos por estado
        </h2>

        {estadisticas.pedidos_por_estado.length === 0 ? (
          <p className="py-8 text-center text-secondary-500">
            No hay pedidos registrados
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {estadisticas.pedidos_por_estado.map((item) => (
              <div key={item.estado} className="p-4 text-center rounded-lg bg-secondary-50">
                <p className="text-3xl font-bold text-secondary-900">{item.cantidad}</p>
                <p className="mt-1 text-sm font-medium text-secondary-600">
                  {item.estado}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
