/**
 * VinIA - Commercial Dashboard (Home)
 * 
 * Panel principal para comerciales.
 * Enfocado en "Mis Ventas", "Mis Clientes" y "Mis Pedidos".
 */

import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Users,
    PlusCircle,
    Clock,
    CheckCircle,
    FileText,
    ChevronRight,
    TrendingDown
} from 'lucide-react';
import { usePedidosStore, useClientesStore, useAuthStore } from '../store';
import { formatearPrecio } from '../utils/helpers';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export const CommercialDashboard = () => {
    const { usuario } = useAuthStore();
    const { pedidos, cargarPedidos } = usePedidosStore();
    const { clientes, cargarClientes } = useClientesStore();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([cargarPedidos(), cargarClientes()]);
            } catch (e) {
                console.error("Error loading commercial data", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [cargarPedidos, cargarClientes]);

    // Filtrar datos SOLO del comercial actual
    const myMetrics = useMemo(() => {
        if (!usuario) return null;

        const myPedidos = pedidos.filter(p => p.usuarioId === usuario.id || (p.usuario as any)?.id === usuario.id);
        const myClients = clientes.filter(c => c.comercial_id === usuario.id); // Asumiendo relación, si no existe mostramos todos o 0

        const validPedidos = myPedidos.filter(p => !['Borrador', 'Cancelado'].includes(p.estado));

        // Ventas Mes Actual vs Mes Anterior
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

        const currentMonthSales = validPedidos
            .filter(p => p.fecha.startsWith(currentMonthKey))
            .reduce((acc, p) => acc + p.total, 0);

        const lastMonthSales = validPedidos
            .filter(p => p.fecha.startsWith(lastMonthKey))
            .reduce((acc, p) => acc + p.total, 0);

        const growth = lastMonthSales > 0 ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 : 100;

        // Pedidos pendientes (Acción requerida o en espera)
        const pendingOrders = myPedidos.filter(p => p.estado === 'Borrador' || p.estado === 'Pendiente' || p.estado === 'PENDIENTE_VALIDACION');

        return {
            myPedidos,
            myClients,
            currentMonthSales,
            lastMonthSales,
            growth,
            pendingOrders,
            validPedidos
        };
    }, [pedidos, clientes, usuario]);

    // Chart Data: My sales last 6 months
    const getSalesData = () => {
        if (!myMetrics) return [];
        const data = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleDateString('es-ES', { month: 'short' });
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            const total = myMetrics.validPedidos
                .filter(p => p.fecha.startsWith(monthKey))
                .reduce((acc, p) => acc + p.total, 0);

            data.push({ name: monthName, total });
        }
        return data;
    };

    if (loading || !myMetrics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 font-serif">
                        Hola, {usuario?.nombre}
                    </h1>
                    <p className="mt-2 text-secondary-600">
                        Aquí tienes el resumen de tu actividad comercial hoy.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/catalogo')} className="btn-secondary">
                        Ver Catálogo
                    </button>
                    <button onClick={() => navigate('/pedidos/nuevo')} className="btn-primary">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Nuevo Pedido
                    </button>
                </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sales Card */}
                <div className="bg-white p-6 rounded-xl shadow-elegant relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-primary-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-secondary-500 font-medium text-sm">Ventas este mes</p>
                        <h3 className="text-3xl font-bold text-secondary-900 mt-2">
                            {formatearPrecio(myMetrics.currentMonthSales)}
                        </h3>
                        <div className="flex items-center mt-4 gap-2 text-sm">
                            {myMetrics.growth >= 0 ? (
                                <span className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +{myMetrics.growth.toFixed(1)}%
                                </span>
                            ) : (
                                <span className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    {myMetrics.growth.toFixed(1)}%
                                </span>
                            )}
                            <span className="text-secondary-400">vs mes anterior</span>
                        </div>
                    </div>
                </div>

                {/* Pedidos Pendientes */}
                <div className="bg-white p-6 rounded-xl shadow-elegant relative overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-secondary-500 font-medium text-sm">En curso / Borradores</p>
                            <h3 className="text-3xl font-bold text-secondary-900 mt-2">
                                {myMetrics.pendingOrders.length}
                            </h3>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg text-yellow-700">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link to="/pedidos" className="text-sm text-primary-600 font-medium hover:text-primary-800 flex items-center">
                            Gestionar mis pedidos <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>

                {/* Clientes Activos (Metric placeholder if no real relation yet) */}
                <div className="bg-white p-6 rounded-xl shadow-elegant relative overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-secondary-500 font-medium text-sm">Mis Clientes</p>
                            <h3 className="text-3xl font-bold text-secondary-900 mt-2">
                                {myMetrics.myClients.length || myMetrics.myPedidos.length /* Fallback to orders count if no client assignment */}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-secondary-500">
                        Clientes con actividad reciente
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-elegant">
                    <h3 className="font-bold text-lg text-secondary-900 mb-6">Mi Rendimiento Semestral</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getSalesData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    tickFormatter={(val) => `${val / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [formatearPrecio(value), 'Ventas']}
                                />
                                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                    {getSalesData().map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 5 ? '#b8945a' : '#e5e7eb'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity List */}
                <div className="bg-white p-6 rounded-xl shadow-elegant">
                    <h3 className="font-bold text-lg text-secondary-900 mb-4">Actividad Reciente</h3>
                    {myMetrics.validPedidos.length === 0 ? (
                        <p className="text-secondary-500 text-sm">No hay actividad reciente.</p>
                    ) : (
                        <div className="space-y-4">
                            {myMetrics.validPedidos.slice(0, 5).map(pedido => (
                                <div key={pedido.id} className="flex items-start gap-3 pb-3 border-b border-secondary-50 last:border-0 last:pb-0">
                                    <div className={`p-2 rounded-full ${pedido.estado === 'Enviado' ? 'bg-green-100 text-green-600' : 'bg-primary-50 text-primary-600'}`}>
                                        {pedido.estado === 'Enviado' ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-secondary-900 truncate">
                                            Pedido #{pedido.numero}
                                        </p>
                                        <p className="text-xs text-secondary-500 truncate">
                                            {pedido.clienteNombre}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-secondary-900">
                                            {formatearPrecio(pedido.total)}
                                        </p>
                                        <p className="text-[10px] text-secondary-400">
                                            {new Date(pedido.fecha).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 pt-4 border-t border-secondary-100 text-center">
                        <Link to="/pedidos" className="text-sm font-medium text-primary-600 hover:text-primary-800">
                            Ver historial completo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
