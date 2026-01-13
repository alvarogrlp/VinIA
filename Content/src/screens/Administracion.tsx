/**
 * VinIA - Pantalla de Administración de Equipo
 * 
 * Vista detallada de rendimiento comercial.
 * Muestra lista de comerciales y sus métricas de ventas con gráficas.
 */

import { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Users,
  TrendingUp,
  ChevronRight,
  X,
  Award,
  DollarSign,
  Package,
  UserPlus
} from 'lucide-react';
import { usePedidosStore } from '../store';
import { authService } from '../services/auth.service';
import { formatearPrecio } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface UsuarioSistema {
  id: string;
  username: string;
  nombre: string;
  apellidos: string | null;
  rol: string;
  activo: boolean;
  ultimo_acceso: string | null;
  created_at: string;
}

export const Administracion = () => {
  const { pedidos, cargarPedidos } = usePedidosStore();
  const [comerciales, setComerciales] = useState<UsuarioSistema[]>([]);
  const [selectedUser, setSelectedUser] = useState<UsuarioSistema | null>(null);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await cargarPedidos();
        const users = await authService.getAllUsers();
        // Filtrar solo comerciales y activos
        setComerciales(users.filter((u: any) => u.rol === 'Comercial' && u.activo));
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cargarPedidos]);

  // Calcular métricas globales de un comercial
  const getUserMetrics = (userId: string) => {
    const userPedidos = pedidos.filter(p => {
      return (p.usuarioId === userId) || ((p.usuario as any)?.id === userId);
    });

    const ventasPedidos = userPedidos.filter(p => !['Borrador', 'Cancelado'].includes(p.estado));

    const totalVentas = ventasPedidos.reduce((sum, p) => sum + p.total, 0);
    const totalPedidos = ventasPedidos.length;
    const ticketMedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    return { totalVentas, totalPedidos, ticketMedio, pedidos: userPedidos };
  };

  // Generar datos para la gráfica
  const getChartData = (userId: string) => {
    const { pedidos: userAllPedidos } = getUserMetrics(userId);
    const ventasPedidos = userAllPedidos.filter(p => !['Borrador', 'Cancelado'].includes(p.estado));

    const now = new Date();
    const data: any[] = [];

    if (timeFrame === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('es-ES', { weekday: 'short' });
        const dateStr = d.toISOString().slice(0, 10);

        const dayTotal = ventasPedidos
          .filter(p => p.fecha.startsWith(dateStr))
          .reduce((sum, p) => sum + p.total, 0);

        data.push({ name: dayStr, ventas: dayTotal });
      }
    } else if (timeFrame === 'month') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        const monthTotal = ventasPedidos
          .filter(p => p.fecha.startsWith(monthKey))
          .reduce((sum, p) => sum + p.total, 0);

        data.push({ name: monthName, ventas: monthTotal });
      }
    } else if (timeFrame === 'year') {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const yearTotal = ventasPedidos
          .filter(p => p.fecha.startsWith(year.toString()))
          .reduce((sum, p) => sum + p.total, 0);

        data.push({ name: year.toString(), ventas: yearTotal });
      }
    }

    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 font-serif">
            Gestión de Equipo Comercial
          </h1>
          <p className="mt-2 text-secondary-600">
            Supervisión detallada de rendimiento y métricas de ventas.
          </p>
        </div>
        <button
          onClick={() => navigate('/usuarios')}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Gestionar Usuarios
        </button>
      </div>

      {/* Grid de Comerciales */}
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          Equipo Activo
        </h2>

        {comerciales.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-elegant">
            <Users className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
            <p className="text-secondary-600">No hay comerciales activos registrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {comerciales.map(user => {
              const metrics = getUserMetrics(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="group relative bg-white rounded-xl shadow-elegant hover:shadow-elegant-lg transition-all duration-300 cursor-pointer overflow-hidden border border-transparent hover:border-primary-200"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                          {user.nombre.charAt(0)}{user.apellidos?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-secondary-900 leading-tight">
                            {user.nombre}
                          </h3>
                          <p className="text-xs text-secondary-500 uppercase tracking-wider">
                            Comercial
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-secondary-600">Ventas Totales</span>
                        <span className="font-bold text-secondary-900 text-lg">
                          {formatearPrecio(metrics.totalVentas)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-secondary-600">Pedidos</span>
                        <span className="font-medium text-secondary-800 bg-secondary-100 px-2 py-0.5 rounded-full text-xs">
                          {metrics.totalPedidos}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      Ver detalles <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal / Overlay Detalle Comercial */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-serif text-2xl shadow-lg">
                  {selectedUser.nombre.charAt(0)}{selectedUser.apellidos?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    {selectedUser.nombre} {selectedUser.apellidos}
                  </h2>
                  <p className="text-secondary-500 flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-primary-500" />
                    Comercial Senior &bull; ID: {selectedUser.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-secondary-500" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-8 overflow-y-auto custom-scrollbar">

              {/* KPIs del Usuario */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-200 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-700" />
                    </div>
                    <span className="text-sm font-semibold text-green-800 uppercase tracking-wider">Ventas Totales</span>
                  </div>
                  <div className="text-3xl font-bold text-secondary-900 mt-2">
                    {formatearPrecio(getUserMetrics(selectedUser.id).totalVentas)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <Package className="w-5 h-5 text-blue-700" />
                    </div>
                    <span className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Pedidos Totales</span>
                  </div>
                  <div className="text-3xl font-bold text-secondary-900 mt-2">
                    {getUserMetrics(selectedUser.id).totalPedidos}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-200 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-700" />
                    </div>
                    <span className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Ticket Medio</span>
                  </div>
                  <div className="text-3xl font-bold text-secondary-900 mt-2">
                    {formatearPrecio(getUserMetrics(selectedUser.id).ticketMedio)}
                  </div>
                </div>
              </div>

              {/* Gráfica de Ventas */}
              <div className="bg-white p-6 rounded-xl border border-secondary-200 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-8 bg-primary-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-secondary-900">Evolución de Ventas</h3>
                  </div>

                  <div className="flex bg-secondary-100 p-1 rounded-lg">
                    <button
                      onClick={() => setTimeFrame('week')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFrame === 'week' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'}`}
                    >
                      Semana
                    </button>
                    <button
                      onClick={() => setTimeFrame('month')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFrame === 'month' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'}`}
                    >
                      Meses
                    </button>
                    <button
                      onClick={() => setTimeFrame('year')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeFrame === 'year' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'}`}
                    >
                      Años
                    </button>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData(selectedUser.id)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b8945a" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#b8945a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickFormatter={(value) => `${value / 1000}k€`}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [formatearPrecio(Number(value) || 0), 'Ventas']}
                      />
                      <Area
                        type="monotone"
                        dataKey="ventas"
                        stroke="#b8945a"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorVentas)"
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#7d6238' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
