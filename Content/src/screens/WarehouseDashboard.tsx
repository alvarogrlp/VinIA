/**
 * VinIA - Warehouse Dashboard
 * 
 * Specific dashboard for the Warehouse / Almacén role.
 * Prioritizes order preparation, stock control, and critical inventory alerts.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Package,
    ClipboardList,
    AlertTriangle,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import { usePedidosStore, useVinosStore } from '../store';

export const WarehouseDashboard = () => {
    const { pedidos, cargarPedidos } = usePedidosStore();
    const { vinos, cargarVinos } = useVinosStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([cargarPedidos(), cargarVinos()]);
            setLoading(false);
        };
        loadData();
    }, [cargarPedidos, cargarVinos]);

    // Métricas y listas para Almacén
    const {
        pedidosPendientes,
        productosBajoStock,
        alertasStockCritico
    } = useMemo(() => {
        const pendientes = pedidos.filter(p => {
            const s = (p.estado || '').toUpperCase();
            return ['PENDIENTE', 'PENDIENTE_VALIDACION', 'PENDIENTE DE VALIDACION', 'EN_PREPARACION'].includes(s);
        });
        // Low stock logic
        const bajoStock = vinos.filter((v: any) => v.stock <= (v.stock_minimo || 10));
        const critico = vinos.filter(v => v.stock === 0);

        return {
            pedidosPendientes: pendientes,
            productosBajoStock: bajoStock,
            alertasStockCritico: critico
        };
    }, [pedidos, vinos]);

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
                        Panel de Almacén
                    </h1>
                    <p className="mt-2 text-secondary-600">
                        Gestión de logística, preparación de pedidos e inventario.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/inventario" className="btn-secondary">
                        <Package className="w-4 h-4 mr-2" />
                        Inventario
                    </Link>
                    <Link to="/pedidos" className="btn-primary">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Todos los Pedidos
                    </Link>
                </div>
            </div>

            {/* KPIs Operativos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-elegant border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-secondary-600 font-medium mb-1">Pendientes de Preparación</h3>
                            <div className="text-3xl font-bold text-secondary-900">{pedidosPendientes.length}</div>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <ClipboardList className="w-6 h-6 text-yellow-700" />
                        </div>
                    </div>
                    {pedidosPendientes.length > 0 && (
                        <p className="text-sm text-yellow-700 mt-4 font-medium">
                            Requieren atención inmediata
                        </p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-elegant border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-secondary-600 font-medium mb-1">Alertas de Stock</h3>
                            <div className="text-3xl font-bold text-secondary-900">{productosBajoStock.length}</div>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-700" />
                        </div>
                    </div>
                    <p className="text-sm text-secondary-500 mt-4">
                        {alertasStockCritico.length} productos agotados
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-elegant border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-secondary-600 font-medium mb-1">Total Referencias</h3>
                            <div className="text-3xl font-bold text-secondary-900">{vinos.length}</div>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Package className="w-6 h-6 text-blue-700" />
                        </div>
                    </div>
                    <p className="text-sm text-secondary-500 mt-4">
                        En catálogo activo
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Principal: Pedidos Pendientes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
                        <div className="p-6 border-b border-secondary-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-primary-600" />
                                Cola de Preparación
                            </h2>
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {pedidosPendientes.length} pendientes
                            </span>
                        </div>

                        {pedidosPendientes.length === 0 ? (
                            <div className="p-12 text-center text-secondary-500">
                                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-200" />
                                <p className="text-lg font-medium text-green-800">Todo al día</p>
                                <p>No hay pedidos pendientes de preparación.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary-50 text-secondary-500 text-xs uppercase font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Pedido / Fecha</th>
                                            <th className="px-6 py-3">Cliente</th>
                                            <th className="px-6 py-3 text-center">Bultos</th>
                                            <th className="px-6 py-3">Estado</th>
                                            <th className="px-6 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary-100">
                                        {pedidosPendientes.slice(0, 10).map(pedido => (
                                            <tr key={pedido.id} className="hover:bg-secondary-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-secondary-900">{pedido.numero}</div>
                                                    <div className="text-xs text-secondary-500">{new Date(pedido.fecha).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-secondary-900">{pedido.clienteNombre}</div>
                                                    <div className="text-xs text-secondary-500">{pedido.direccionEntrega ? 'Con envío' : 'Recogida'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {pedido.lineas.reduce((acc, l) => acc + (l.cantidadBultos || 0), 0) || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Pendiente
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        to={`/pedidos/${pedido.id}`}
                                                        className="text-primary-600 hover:text-primary-800 font-medium text-sm inline-flex items-center"
                                                    >
                                                        Ver detalle
                                                        <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="p-4 border-t border-secondary-100 bg-secondary-50 text-center">
                            <Link to="/pedidos?estado=Pendiente" className="text-sm font-medium text-primary-600 hover:text-primary-800">
                                Ver todos los pedidos pendientes
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Columna Lateral: Stock Critico */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-elegant overflow-hidden">
                        <div className="p-6 border-b border-secondary-100">
                            <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Reposición Urgente
                            </h2>
                        </div>

                        {productosBajoStock.length === 0 ? (
                            <div className="p-6 text-center text-secondary-500">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-200" />
                                <p>Inventario saludable</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-secondary-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {productosBajoStock.map(vino => (
                                    <div key={vino.id} className="p-4 hover:bg-red-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-medium text-secondary-900 text-sm line-clamp-1" title={vino.nombre}>
                                                {vino.nombre}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${vino.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                                {vino.stock} uds
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-secondary-500">
                                            <span>Min: {(vino as any).stock_minimo || 10}</span>
                                            <Link to={`/inventario?search=${encodeURIComponent(vino.nombre)}`} className="text-primary-600 hover:underline">
                                                Gestionar
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
