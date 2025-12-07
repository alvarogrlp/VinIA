/**
 * Pantalla de Detalle de Cliente
 * Muestra información del cliente y su historial de pedidos
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientesStore } from '../store';
import { ArrowLeft, Mail, Phone, MapPin, Building, Calendar, ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';

interface PedidoHistorial {
    id: string;
    numero: string;
    fecha: string;
    estado: string;
    total: number;
}

export const DetalleCliente = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { clientes, cargarClientes } = useClientesStore();
    const [pedidos, setPedidos] = useState<PedidoHistorial[]>([]);
    const [cargando, setCargando] = useState(true);

    const cliente = clientes.find(c => c.id === id);

    useEffect(() => {
        if (clientes.length === 0) {
            cargarClientes();
        }
    }, [cargarClientes, clientes.length]);

    useEffect(() => {
        if (id) {
            cargarPedidos(id);
        }
    }, [id]);

    const cargarPedidos = async (clienteId: string) => {
        try {
            setCargando(true);
            const data = await api.get(`/clientes/${clienteId}/pedidos`);
            setPedidos(data || []);
        } catch (error) {
            console.error('Error al cargar pedidos del cliente:', error);
        } finally {
            setCargando(false);
        }
    };

    if (!cliente) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-xl font-bold text-secondary-900">Cliente no encontrado</h2>
                <button
                    onClick={() => navigate('/clientes')}
                    className="mt-4 text-primary-600 hover:text-primary-700"
                >
                    Volver a clientes
                </button>
            </div>
        );
    }



    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/clientes')}
                    className="p-2 transition-colors bg-white border rounded-lg hover:bg-secondary-50 border-secondary-200 text-secondary-600"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold font-serif text-secondary-900">
                        {cliente.nombre}
                    </h1>
                    <p className="text-secondary-600">
                        Detalle del cliente e historial
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Info Cliente */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="p-6 bg-white shadow-sm rounded-xl border border-secondary-200">
                        <h2 className="mb-4 text-lg font-semibold text-secondary-900">Información</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Building className="w-5 h-5 mt-0.5 text-secondary-400" />
                                <div>
                                    <p className="text-sm font-medium text-secondary-900">CIF / Identificación</p>
                                    <p className="text-secondary-600">{cliente.cif}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-0.5 text-secondary-400" />
                                <div>
                                    <p className="text-sm font-medium text-secondary-900">Dirección</p>
                                    <p className="text-secondary-600">{cliente.direccion}</p>
                                    <p className="text-secondary-600">{cliente.ciudad}, {cliente.provincia}</p>
                                    <p className="text-secondary-600">{cliente.codigoPostal}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 mt-0.5 text-secondary-400" />
                                <div>
                                    <p className="text-sm font-medium text-secondary-900">Teléfono</p>
                                    <p className="text-secondary-600">{cliente.telefono}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="w-5 h-5 mt-0.5 text-secondary-400" />
                                <div>
                                    <p className="text-sm font-medium text-secondary-900">Email</p>
                                    <p className="text-secondary-600">{cliente.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-secondary-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-secondary-500">Tipo</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium border border-primary-100">
                                    {cliente.tipo}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historial Pedidos */}
                <div className="bg-white shadow-sm rounded-xl border border-secondary-200 lg:col-span-2">
                    <div className="p-6 border-b border-secondary-200 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-primary-600" />
                            <h2 className="text-lg font-semibold text-secondary-900">Historial de Pedidos</h2>
                        </div>
                        <button
                            onClick={() => navigate(`/clientes/${id}/historico`)}
                            className="btn-outline py-1.5 px-3 text-sm flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Ver Histórico Completo
                        </button>
                    </div>

                    <div className="p-6">
                        {cargando ? (
                            <div className="flex justify-center py-8">
                                <div className="w-8 h-8 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
                            </div>
                        ) : pedidos.length === 0 ? (
                            <div className="text-center py-12 text-secondary-500 bg-secondary-50 rounded-lg border border-dashed border-secondary-300">
                                <p>No hay pedidos registrados para este cliente</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pedidos
                                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                                    .slice(0, 5) // Mostramos solo los últimos 5
                                    .map((pedido) => (
                                        <div
                                            key={pedido.id}
                                            onClick={() => navigate(`/clientes/${id}/historico`)}
                                            className="flex items-center justify-between p-4 bg-white border rounded-lg border-secondary-200 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-full bg-secondary-100 text-secondary-500 group-hover:bg-primary-100 group-hover:text-primary-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-secondary-900">
                                                        {new Date(pedido.fecha).toLocaleDateString()}
                                                    </div>
                                                    <p className="text-xs text-secondary-500">
                                                        {pedido.numero}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <p className="font-bold text-secondary-900">
                                                    {pedido.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                {pedidos.length > 5 && (
                                    <button
                                        onClick={() => navigate(`/clientes/${id}/historico`)}
                                        className="w-full py-2 text-sm text-center text-primary-600 hover:text-primary-700 font-medium hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        Ver historial completo ({pedidos.length})
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
