/**
 * Pantalla de Pedidos Pendientes
 * Muestra los borradores y pedidos pendientes de procesar
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePedidosStore } from '../store';
import { Clock, ShoppingCart, ChevronRight, AlertCircle, Calendar, DollarSign, User, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

export const PedidosPendientes = () => {
    const { pedidos, cargarPedidos, eliminarPedido } = usePedidosStore();
    const navigate = useNavigate();
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });

    useEffect(() => {
        cargarPedidos();
    }, [cargarPedidos]);

    const pendingOrders = pedidos.filter(p => {
        const s = (p.estado || '').toUpperCase();
        return s === 'BORRADOR';
    });

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold font-serif text-secondary-900">
                    Pedidos Pendientes
                </h1>
                <p className="text-secondary-600">
                    Gestiona tus borradores y pedidos en curso
                </p>
            </div>

            {/* Info Banner */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-primary-900">Recordatorio de Cierre</h3>
                    <p className="text-sm text-primary-800 mt-1">
                        Recuerda validar los borradores antes de las 18:00 para asegurar el envío en el día.
                        Los pedidos pendientes de aprobación comercial deben revisarse lo antes posible.
                    </p>
                </div>
            </div>

            {/* Grid de Pedidos */}
            {pendingOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-secondary-300">
                    <div className="p-4 bg-secondary-50 class rounded-full mb-4">
                        <ShoppingCart className="w-12 h-12 text-secondary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-secondary-900">No hay pedidos pendientes</h3>
                    <p className="text-secondary-500 max-w-sm text-center mt-2">
                        Todos tus pedidos han sido procesados o no tienes borradores activos en este momento.
                    </p>
                    <button
                        onClick={() => navigate('/clientes')}
                        className="mt-6 btn-primary"
                    >
                        Nuevo Pedido
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pendingOrders.map(pedido => (
                        <div key={pedido.id} className="bg-white border border-secondary-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group relative flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${pedido.estado === 'Borrador' || pedido.estado === 'BORRADOR'
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                    }`}>
                                    {pedido.estado}
                                </span>
                                <div className="flex items-center text-xs text-secondary-500 bg-secondary-50 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(pedido.fecha).toLocaleDateString()}
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDelete({ isOpen: true, id: pedido.id });
                                }}
                                className="absolute top-12 right-4 p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Eliminar Borrador"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-secondary-400" />
                                    <h3 className="font-bold text-lg text-secondary-900 line-clamp-1" title={pedido.clienteNombre}>
                                        {pedido.clienteNombre}
                                    </h3>
                                </div>
                                <p className="text-sm text-secondary-500 pl-6 mb-3">Ref: {pedido.numero}</p>

                                {/* Lista de productos */}
                                <div className="bg-secondary-50 rounded-lg p-3 space-y-2 mb-2">
                                    {pedido.lineas.slice(0, 3).map((linea, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-secondary-700 line-clamp-1 flex-1 mr-2" title={linea.vinoNombre || linea.vino?.nombre}>
                                                {linea.vinoNombre || linea.vino?.nombre || 'Producto desconocido'}
                                            </span>
                                            <span className="font-medium text-secondary-900 whitespace-nowrap">
                                                x{linea.cantidad}
                                            </span>
                                        </div>
                                    ))}
                                    {pedido.lineas.length > 3 && (
                                        <p className="text-xs text-secondary-500 text-center pt-1 border-t border-secondary-200 mt-2">
                                            + {pedido.lineas.length - 3} productos más
                                        </p>
                                    )}
                                    {pedido.lineas.length === 0 && (
                                        <p className="text-xs text-secondary-400 italic text-center">Sin productos</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-secondary-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs text-secondary-500">Total</span>
                                    <span className="text-primary-600 font-bold text-lg">
                                        {pedido.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        // Preparamos las líneas para el estado de NuevoPedido
                                        // NuevoPedido espera: { clienteId, lineas: [...], ... }
                                        // Las lineas deben tener formato compatible con agregarLineaPedido o el loop de NuevoPedido
                                        const lineasParaState = pedido.lineas.map(l => ({
                                            vinoId: l.vino?.id || l.vinoId,
                                            vinoNombre: l.vino?.nombre || l.vinoNombre,
                                            cantidad: l.cantidad,
                                            precioUnitario: l.precioUnitario,
                                            descuento: l.descuento,
                                            subtotal: l.subtotal,
                                            anada: l.anada,
                                            tipoBulto: l.tipoBulto || 'BOTELLA', // Preservar el valor original
                                            cantidadBultos: l.cantidadBultos || l.cantidad
                                        }));

                                        navigate('/pedidos/nuevo', {
                                            state: {
                                                clienteId: pedido.clienteId,
                                                lineas: lineasParaState,
                                                direccionEnvio: pedido.direccionEnvioSnapshot || '',
                                                instrucciones: pedido.instruccionesEntrega || '',
                                                originalOrderId: pedido.id
                                            }
                                        });
                                    }}
                                    className="flex items-center gap-1.5 text-sm font-medium text-white bg-secondary-900 hover:bg-primary-600 px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    Gestionar <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={async () => {
                    if (confirmDelete.id) {
                        await eliminarPedido(confirmDelete.id);
                        setConfirmDelete({ isOpen: false, id: null });
                    }
                }}
                title="Eliminar Borrador"
                message="¿Estás seguro de que deseas eliminar este borrador? Esta acción no se puede deshacer."
                type="danger"
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    );
};
