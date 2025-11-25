/**
 * VinIA - Pantalla de Administración
 * 
 * Panel de supervisión y gestión de comerciales.
 * Solo accesible para usuarios con rol 'Administración'.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  Wine,
  UserCheck,
  ArrowRight,
  Euro
} from 'lucide-react';
import { useAuthStore } from '../store';
import { administracionService } from '../services/administracion.service';
import { formatearPrecio } from '../utils/helpers';

interface ComercialResumen {
  id: string;
  username: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
  stats: {
    total_ventas: number;
    num_pedidos: number;
    num_clientes: number;
    ticket_medio: number;
  };
}

export const Administracion = () => {
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const [comerciales, setComerciales] = useState<ComercialResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (usuario?.rol === 'Administración') {
      cargarComerciales();
    }
  }, [usuario?.rol]);

  // Verificar que el usuario es administración
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

  const cargarComerciales = async () => {
    try {
      setCargando(true);
      const data = await administracionService.obtenerResumenComerciales();
      setComerciales(data);
    } catch (error) {
      console.error('Error cargando comerciales:', error);
    } finally {
      setCargando(false);
    }
  };

  // Calcular totales generales
  const totales = comerciales.reduce(
    (acc, c) => ({
      ventas: acc.ventas + (c.stats?.total_ventas || 0),
      pedidos: acc.pedidos + (c.stats?.num_pedidos || 0),
      clientes: acc.clientes + (c.stats?.num_clientes || 0),
    }),
    { ventas: 0, pedidos: 0, clientes: 0 }
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Administración</h1>
        <p className="mt-2 text-secondary-600">
          Supervisa el rendimiento de tus comerciales y gestiona asignaciones de clientes
        </p>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Comerciales activos</p>
              <p className="mt-2 text-3xl font-bold text-secondary-900">
                {comerciales.length}
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
              <p className="text-sm font-medium text-secondary-600">Ventas totales</p>
              <p className="mt-2 text-3xl font-bold text-secondary-900">
                {formatearPrecio(totales.ventas)}
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
              <p className="text-sm font-medium text-secondary-600">Pedidos totales</p>
              <p className="mt-2 text-3xl font-bold text-secondary-900">
                {totales.pedidos}
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
                {totales.clientes}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <UserCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <button
          onClick={() => navigate('/administracion/asignaciones')}
          className="card group hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary-100">
              <UserCheck className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                Asignar clientes
              </h3>
              <p className="mt-1 text-sm text-secondary-600">
                Gestiona qué clientes pertenecen a cada comercial
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => navigate('/vinos/nuevo')}
          className="card group hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-accent-100">
              <Wine className="w-6 h-6 text-accent-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                Añadir vino
              </h3>
              <p className="mt-1 text-sm text-secondary-600">
                Agregar nuevo producto al catálogo
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => navigate('/clientes/nuevo')}
          className="card group hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                Añadir cliente
              </h3>
              <p className="mt-1 text-sm text-secondary-600">
                Registrar nuevo cliente en el sistema
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>

      {/* Lista de comerciales */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            Rendimiento de comerciales
          </h2>
        </div>

        {cargando ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-primary-600 border-t-transparent animate-spin"></div>
            <p className="text-secondary-600">Cargando comerciales...</p>
          </div>
        ) : (
          <>
            {comerciales.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
                <p className="text-secondary-600">No hay comerciales registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Comercial</th>
                  <th>Clientes</th>
                  <th>Pedidos</th>
                  <th className="text-right">Ventas totales</th>
                  <th className="text-right">Ticket medio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {comerciales.map((comercial) => (
                  <tr key={comercial.id}>
                    <td>
                      <div>
                        <p className="font-medium text-secondary-900">
                          {comercial.nombre} {comercial.apellidos}
                        </p>
                        <p className="text-sm text-secondary-500">@{comercial.username}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-secondary-400" />
                        <span className="font-medium">
                          {comercial.stats?.num_clientes || 0}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-secondary-400" />
                        <span className="font-medium">
                          {comercial.stats?.num_pedidos || 0}
                        </span>
                      </div>
                    </td>
                    <td className="text-right font-semibold text-secondary-900">
                      {formatearPrecio(comercial.stats?.total_ventas || 0)}
                    </td>
                    <td className="text-right text-secondary-600">
                      {formatearPrecio(comercial.stats?.ticket_medio || 0)}
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/administracion/comercial/${comercial.id}`)}
                        className="btn-outline !py-2 !px-3 text-sm"
                      >
                        Ver detalles
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
