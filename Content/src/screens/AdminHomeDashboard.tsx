/**
 * VinIA - Admin Home Dashboard
 * 
 * Visión general ejecutiva para el Administrador al entrar.
 * Muestra KPIs globales de negocio y estado del sistema.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    ShoppingCart,
    Users,
    AlertCircle,
    ArrowRight,
    Activity,
    DollarSign
} from 'lucide-react';
import { usePedidosStore, useVinosStore, useClientesStore } from '../store';
import { authService } from '../services/auth.service';
import { formatearPrecio } from '../utils/helpers';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export const AdminHomeDashboard = () => {
    const { pedidos, cargarPedidos } = usePedidosStore();
    const { vinos, cargarVinos } = useVinosStore();
    const { clientes, cargarClientes } = useClientesStore();
    const [usersCount, setUsersCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState<'day' | 'month' | 'year'>('day');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([cargarPedidos(), cargarVinos(), cargarClientes()]);
                const users = await authService.getAllUsers();
                setUsersCount(users.length);
            } catch (e) {
                console.error("Error loading dashboard data", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [cargarPedidos, cargarVinos, cargarClientes]);

    // KPIs
    const totalVentas = pedidos
        .filter(p => p.estado !== 'Cancelado' && p.estado !== 'Borrador')
        .reduce((acc, p) => acc + p.total, 0);

    const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente' || p.estado === 'PENDIENTE_VALIDACION').length;

    const lowStock = vinos.filter(v => (v as any).stock <= ((v as any).stock_minimo || 10)).length;

    // Chart Data (Last 7 days revenue)
    // Chart Data
    const getChartData = () => {
        const data = [];
        const now = new Date();

        if (timeFrame === 'day') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dayStr = d.toLocaleDateString('es-ES', { weekday: 'short' });
                const dateKey = d.toISOString().slice(0, 10);

                const total = pedidos
                    .filter(p => p.fecha.startsWith(dateKey) && !['Cancelado', 'Borrador'].includes(p.estado))
                    .reduce((acc, p) => acc + p.total, 0);

                data.push({ name: dayStr, value: total });
            }
        } else if (timeFrame === 'month') {
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

                const total = pedidos
                    .filter(p => p.fecha.startsWith(monthKey) && !['Cancelado', 'Borrador'].includes(p.estado))
                    .reduce((acc, p) => acc + p.total, 0);

                data.push({ name: monthName, value: total });
            }
        } else if (timeFrame === 'year') {
            for (let i = 4; i >= 0; i--) {
                const year = now.getFullYear() - i;
                const yearKey = year.toString();

                const total = pedidos
                    .filter(p => p.fecha.startsWith(yearKey) && !['Cancelado', 'Borrador'].includes(p.estado))
                    .reduce((acc, p) => acc + p.total, 0);

                data.push({ name: yearKey, value: total });
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
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 font-serif">
                        Panel Ejecutivo
                    </h1>
                    <p className="mt-2 text-secondary-600">
                        Visión global del negocio y estado del sistema.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link to="/administracion" className="btn-secondary">
                        <Users className="w-4 h-4 mr-2" />
                        Gestión Equipo
                    </Link>
                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center border border-green-200">
                        <Activity className="w-4 h-4 mr-2" />
                        Sistema Operativo
                    </div>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-elegant border-l-4 border-primary-600">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Ingresos Totales</p>
                            <h3 className="text-2xl font-bold text-secondary-900 mt-1">{formatearPrecio(totalVentas)}</h3>
                        </div>
                        <div className="p-2 bg-primary-50 rounded-lg">
                            <DollarSign className="w-5 h-5 text-primary-600" />
                        </div>
                    </div>
                    <p className="text-xs text-secondary-400">Volumen histórico acumulado</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-elegant border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Pedidos Activos</p>
                            <h3 className="text-2xl font-bold text-secondary-900 mt-1">{pedidos.length}</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-blue-600 font-medium">{pedidosPendientes} requieren validación</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-elegant border-l-4 border-purple-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Usuarios Totales</p>
                            <h3 className="text-2xl font-bold text-secondary-900 mt-1">{usersCount}</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-secondary-500">
                        <span className="font-semibold text-purple-700">{clientes.length}</span> clientes registrados
                    </div>
                </div>

                <div className={`bg-white p-6 rounded-xl shadow-elegant border-l-4 ${lowStock > 0 ? 'border-red-500' : 'border-green-500'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Estado Inventario</p>
                            <h3 className="text-2xl font-bold text-secondary-900 mt-1">{vinos.length} Refs</h3>
                        </div>
                        <div className={`p-2 rounded-lg ${lowStock > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                            <AlertCircle className={`w-5 h-5 ${lowStock > 0 ? 'text-red-600' : 'text-green-600'}`} />
                        </div>
                    </div>
                    {lowStock > 0 ? (
                        <p className="text-xs text-red-600 font-medium">{lowStock} productos bajo mínimos</p>
                    ) : (
                        <p className="text-xs text-green-600 font-medium">Stock saludable</p>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-elegant">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg text-secondary-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-600" />
                            Ingresos
                        </h3>
                        <div className="flex bg-secondary-100 p-1 rounded-lg">
                            <button
                                onClick={() => setTimeFrame('day')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeFrame === 'day' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'}`}
                            >
                                7 Días
                            </button>
                            <button
                                onClick={() => setTimeFrame('month')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeFrame === 'month' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'}`}
                            >
                                Meses
                            </button>
                            <button
                                onClick={() => setTimeFrame('year')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${timeFrame === 'year' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'}`}
                            >
                                Años
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getChartData()}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#b8945a" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#b8945a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(val) => `${val}€`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [`${value}€`, 'Ventas']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#b8945a"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders / Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-elegant">
                        <h3 className="font-bold text-lg text-secondary-900 mb-4">Acciones Rápidas</h3>
                        <div className="space-y-3">
                            <Link to="/usuarios" className="block p-3 rounded-lg border border-secondary-100 hover:border-primary-300 hover:bg-primary-50 transition-all group">
                                <div className="flex items-center justify-between">
                                    <span className="text-secondary-700 font-medium group-hover:text-primary-800">Gestionar Usuarios</span>
                                    <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-600" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
