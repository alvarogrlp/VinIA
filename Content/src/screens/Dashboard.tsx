/**
 * VinIA - Pantalla Dashboard
 * 
 * Pantalla principal que muestra resumen de métricas clave,
 * estadísticas de ventas y accesos rápidos.
 */

import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Users,
  Wine,
  ArrowRight,
  Euro,
  Package
} from 'lucide-react';
import { useVinosStore, useClientesStore, usePedidosStore, useAuthStore } from '../store';
import { formatearPrecio } from '../utils/helpers';

const getBadgeEstado = (estado: string) => {
  if (estado === 'Enviado') return 'badge-success';
  if (estado === 'Procesando') return 'badge-warning';
  if (estado === 'Pendiente') return 'badge-info';
  if (estado === 'Cancelado') return 'badge-danger';
  return 'badge-secondary';
};

export const Dashboard = () => {
  const { vinos, cargarVinos } = useVinosStore();
  const { clientes, cargarClientes } = useClientesStore();
  const { pedidos, cargarPedidos } = usePedidosStore();
  const { usuario } = useAuthStore();

  useEffect(() => {
    cargarVinos();
    cargarClientes();
    cargarPedidos();
  }, [cargarVinos, cargarClientes, cargarPedidos]);

  const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente');

  // Calcular métricas reales
  const metricas = useMemo(() => {
    const stockTotal = vinos.reduce((sum, vino) => sum + vino.stock, 0);
    const ventasDelMes = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
    const clientesActivos = clientes.filter(c => c.activo).length;
    const totalPedidos = pedidos.length;

    return [
      {
        titulo: 'Ventas del mes',
        valor: formatearPrecio(ventasDelMes),
        icon: Euro,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      {
        titulo: 'Pedidos totales',
        valor: totalPedidos.toString(),
        icon: ShoppingCart,
        color: 'text-primary-600',
        bgColor: 'bg-primary-100',
      },
      {
        titulo: 'Clientes activos',
        valor: clientesActivos.toString(),
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      {
        titulo: 'Productos en stock',
        valor: stockTotal.toLocaleString('es-ES'),
        icon: Package,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
    ];
  }, [vinos, clientes, pedidos]);

  // Accesos rápidos
  const accesosRapidos = [
    {
      titulo: 'Nuevo pedido',
      descripcion: 'Crear un pedido para un cliente',
      ruta: '/pedidos/nuevo',
      icon: ShoppingCart,
      color: 'primary',
    },
    {
      titulo: 'Ver catálogo',
      descripcion: 'Explorar vinos disponibles',
      ruta: '/catalogo',
      icon: Wine,
      color: 'accent',
    },
    {
      titulo: 'Gestionar clientes',
      descripcion: 'Ver y editar clientes',
      ruta: '/clientes',
      icon: Users,
      color: 'secondary',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">
          Dashboard
        </h1>
        <p className="mt-2 text-secondary-600">
          Bienvenido a VinIA. Aquí tienes un resumen de tu actividad comercial.
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricas.map((metrica) => {
          const Icon = metrica.icon;
          return (
            <div key={metrica.titulo} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">
                    {metrica.titulo}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-secondary-900">
                    {metrica.valor}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${metrica.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metrica.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Almacén Workflow: Pedidos Pendientes */}
      {usuario?.rol === 'Almacén' && pedidosPendientes.length > 0 && (
        <div className="p-4 mb-8 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-xl">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-yellow-800">
                ⚠ Tienes {pedidosPendientes.length} pedidos pendientes de preparación
              </h2>
              <p className="mt-1 text-yellow-700">
                Revisa el listado de pedidos para comenzar la preparación.
              </p>
            </div>
            <Link
              to="/pedidos?estado=Pendiente"
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 shadow-sm"
            >
              Ver pendientes
            </Link>
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-secondary-900">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {accesosRapidos.map((acceso) => {
            const Icon = acceso.icon;
            return (
              <Link
                key={acceso.ruta}
                to={acceso.ruta}
                className="card group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${acceso.color}-100`}>
                    <Icon className={`w-6 h-6 text-${acceso.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {acceso.titulo}
                    </h3>
                    <p className="mt-1 text-sm text-secondary-600">
                      {acceso.descripcion}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Gráfico o tabla de ventas recientes */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            Actividad reciente
          </h2>
          <Link
            to="/pedidos"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Ver todos
          </Link>
        </div>

        {/* Tabla simple de pedidos recientes */}
        <div className="overflow-x-auto">
          {pedidos.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
              <p className="text-secondary-600">
                No hay pedidos registrados aún.
              </p>
              <Link
                to="/pedidos/nuevo"
                className="btn-primary mt-4 inline-flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Crear primer pedido
              </Link>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.slice(0, 5).map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="font-medium text-secondary-900">{pedido.numero}</td>
                    <td>{pedido.clienteNombre}</td>
                    <td>{new Date(pedido.fecha).toLocaleDateString('es-ES')}</td>
                    <td>
                      <span className={getBadgeEstado(pedido.estado)}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="font-semibold text-right text-secondary-900">
                      {formatearPrecio(pedido.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
