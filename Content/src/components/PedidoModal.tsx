import { X, User, ShoppingBag, FileText, Truck } from 'lucide-react';
import type { Pedido, EstadoPedido } from '../types';
import { formatearPrecio } from '../utils/helpers';

interface PedidoModalProps {
    pedido: Pedido | null;
    onClose: () => void;
    onCambiarEstado: (id: string, nuevoEstado: EstadoPedido) => Promise<void>;
    rol?: string;
}

export const PedidoModal = ({ pedido, onClose, onCambiarEstado, rol }: PedidoModalProps) => {
    if (!pedido) return null;

    const steps = [
        { status: 'Pendiente', label: 'Pendiente' },
        { status: 'EN_PREPARACION', label: 'En Preparación' },
        { status: 'EN_REPARTO', label: 'En Reparto' },
        { status: 'Entregado', label: 'Entregado' },
    ];

    const currentStepIndex = steps.findIndex(s => s.status === pedido.estado || s.status === pedido.estado.replace(/ /g, '_'));

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                    <div>
                        <h2 className="text-2xl font-bold text-secondary-900">Pedido {pedido.numero}</h2>
                        <p className="text-secondary-500 text-sm">
                            Realizado el {new Date(pedido.fecha).toLocaleString()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-secondary-400 hover:text-secondary-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Estado Stepper */}
                    <div className="w-full">
                        <div className="flex items-center justify-between relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary-100 -z-10"></div>
                            {steps.map((step, idx) => (
                                <div key={step.status} className="flex flex-col items-center bg-white px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${idx <= currentStepIndex ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-secondary-300 text-secondary-300'
                                        }`}>
                                        {idx + 1}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${idx <= currentStepIndex ? 'text-primary-700' : 'text-secondary-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Cliente Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-secondary-900">
                                <User className="w-4 h-4" /> Cliente y Entrega
                            </h3>
                            <div className="p-4 bg-secondary-50 rounded-lg space-y-2 text-sm">
                                <p><span className="font-medium">Cliente:</span> {pedido.clienteNombre}</p>
                                <p><span className="font-medium">CIF:</span> {pedido.cliente?.cif || '-'}</p>
                                <p><span className="font-medium">Dirección:</span> {pedido.direccionEntrega || pedido.cliente?.direccion || '-'}</p>
                                <p><span className="font-medium">Contacto:</span> {pedido.cliente?.personaContacto || '-'}</p>
                                <p><span className="font-medium">Teléfono:</span> {pedido.cliente?.telefono || '-'}</p>
                            </div>
                        </div>

                        {/* Comercial Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2 text-secondary-900">
                                <FileText className="w-4 h-4" /> Detalles Administrativos
                            </h3>
                            <div className="p-4 bg-secondary-50 rounded-lg space-y-2 text-sm">
                                <p><span className="font-medium">Comercial Asignado:</span> {pedido.usuario?.nombre ? `${pedido.usuario.nombre} ${pedido.usuario.apellidos}` : 'No asignado'}</p>
                                <p><span className="font-medium">Forma de Pago:</span> {pedido.formaPago || 'No especificada'}</p>
                                {pedido.notas && (
                                    <div className="mt-2 pt-2 border-t border-secondary-200">
                                        <p className="font-medium text-xs text-secondary-500 mb-1">Notas:</p>
                                        <p className="italic text-secondary-700">{pedido.notas}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lineas de Pedido */}
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 text-secondary-900 mb-4">
                            <ShoppingBag className="w-4 h-4" /> Productos
                        </h3>
                        <div className="border border-secondary-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-secondary-50 text-secondary-500 font-medium border-b border-secondary-200">
                                    <tr>
                                        <th className="p-3">Producto</th>
                                        <th className="p-3 text-center">Cantidad</th>
                                        <th className="p-3 text-right">Precio</th>
                                        <th className="p-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-secondary-100">
                                    {pedido.lineas.map((linea, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3">
                                                <p className="font-medium text-secondary-900">{linea.vinoNombre || linea.vino?.nombre}</p>
                                                <p className="text-xs text-secondary-500">{linea.vino?.bodega}</p>
                                            </td>
                                            <td className="p-3 text-center">{linea.cantidad}</td>
                                            <td className="p-3 text-right">{formatearPrecio(linea.precioUnitario)}</td>
                                            <td className="p-3 text-right font-medium">{formatearPrecio(linea.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-secondary-50 font-bold text-secondary-900">
                                    <tr>
                                        <td colSpan={3} className="p-3 text-right">Total</td>
                                        <td className="p-3 text-right">{formatearPrecio(pedido.total)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex justify-end pt-4 border-t border-secondary-200 gap-3">
                        <button onClick={onClose} className="btn-outline">Cerrar</button>
                        {/* Specific actions for Warehouse */}
                        {rol === 'Almacén' && (
                            <div className="flex gap-2">
                                {pedido.estado === 'EN_PREPARACION' || pedido.estado === 'En Preparación' ? (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('¿Confirmar que el pedido está listo para reparto?')) {
                                                onCambiarEstado(pedido.id, 'EN_REPARTO' as EstadoPedido);
                                                onClose();
                                            }
                                        }}
                                        className="btn-primary bg-purple-600 hover:bg-purple-700"
                                    >
                                        <Truck className="w-4 h-4 mr-2" />
                                        Marcar Listo para Reparto
                                    </button>
                                ) : null}

                                {/* If coming from 'Pendiente' (e.g. validated) */}
                                {(pedido.estado === 'Pendiente' || pedido.estado === 'Confirmado') && (
                                    <button
                                        onClick={() => {
                                            onCambiarEstado(pedido.id, 'EN_PREPARACION' as EstadoPedido);
                                            // Don't close, let them see it updated or just close
                                            onClose();
                                        }}
                                        className="btn-primary"
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Empezar Preparación
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
