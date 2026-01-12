/**
 * VinIA - Histórico Profesional de Cliente
 * 
 * Vista detallada de todos los pedidos de un cliente con filtros avanzados
 * y visualización desglosada para análisis de hábitos de compra.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Filter, Download, ChevronDown, ChevronUp, Package, CheckSquare } from 'lucide-react';
import { useClientesStore } from '../store';
import { api } from '../lib/api';
import { formatearPrecio } from '../utils/helpers';
import type { Pedido, Vino } from '../types';
import { VinoDetalleModal } from '../components/VinoDetalleModal';

export const HistoricoCliente = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { clientes, cargarClientes } = useClientesStore();

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [vinoSeleccionado, setVinoSeleccionado] = useState<Vino | null>(null);

    // Filtros
    const [busqueda, setBusqueda] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [rangoPrecio, setRangoPrecio] = useState({ min: '', max: '' });

    // Estado de UI
    const [pedidosExpandidos, setPedidosExpandidos] = useState<Set<string>>(new Set());

    const cliente = clientes.find(c => c.id === id);

    useEffect(() => {
        if (clientes.length === 0) {
            cargarClientes();
        }
    }, [cargarClientes, clientes.length]);

    useEffect(() => {
        if (id) {
            cargarHistorial();
        }
    }, [id]);

    const cargarHistorial = async () => {
        try {
            setCargando(true);
            const data = await api.get(`/pedidos?clienteId=${id}`);

            // Mapear datos para asegurar que nombres de vinos y otros campos calculados estén disponibles
            const pedidosMapeados = (data || []).map((p: any) => ({
                ...p,
                // Asegurar compatibilidad de campos si vienen anidados
                usuario: p.usuario,
                clienteNombre: p.cliente?.nombre || 'Cliente Desconocido',
                lineas: p.lineas.map((l: any) => ({
                    ...l,
                    vino: l.vino, // Preservar el objeto vino completo si existe
                    vinoNombre: l.vino?.nombre || l.vinoNombre || 'Producto Desconocido',
                    precioUnitario: l.precioUnitario || l.vino?.precio_unitario || 0,
                    anada: l.anada || l.vino?.ano,
                    // Si el backend no envía subtotal de línea, calcularlo
                    subtotal: l.subtotal || ((l.cantidad * (l.precioUnitario || l.vino?.precio_unitario || 0)) * (1 - (l.descuento || 0) / 100))
                }))
            }));

            setPedidos(pedidosMapeados);

            if (pedidosMapeados.length > 0) {
                setPedidosExpandidos(new Set([pedidosMapeados[0].id]));
            }
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setCargando(false);
        }
    };

    const togglePedido = (pedidoId: string) => {
        const newSet = new Set(pedidosExpandidos);
        if (newSet.has(pedidoId)) {
            newSet.delete(pedidoId);
        } else {
            newSet.add(pedidoId);
        }
        setPedidosExpandidos(newSet);
    };

    const pedidosFiltrados = useMemo(() => {
        return pedidos.filter(pedido => {
            // Filtro de texto (busca en ID, info de vinos)
            const textoMatch = !busqueda ||
                pedido.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
                pedido.lineas.some(l => (l.vinoNombre || '').toLowerCase().includes(busqueda.toLowerCase()));

            const fechaPedido = new Date(pedido.fecha);
            const fechaInicioMatch = !fechaInicio || fechaPedido >= new Date(fechaInicio);
            const fechaFinMatch = !fechaFin || fechaPedido <= new Date(fechaFin);

            const precioMinMatch = !rangoPrecio.min || pedido.total >= Number(rangoPrecio.min);
            const precioMaxMatch = !rangoPrecio.max || pedido.total <= Number(rangoPrecio.max);

            return textoMatch && fechaInicioMatch && fechaFinMatch && precioMinMatch && precioMaxMatch;
        }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [pedidos, busqueda, fechaInicio, fechaFin, rangoPrecio]);

    if (!cliente && !cargando) {
        return <div className="p-8 text-center">Cliente no encontrado</div>;
    }

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/clientes/${id}`)}
                        className="btn-outline"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900">Histórico Profesional</h1>
                        <p className="text-secondary-600">
                            {cliente?.nombre} • {cliente?.cif}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-secondary-500">Total Pedidos: {pedidos.length}</span>
                </div>
            </div>

            {/* Panel de Filtros */}
            <div className="card p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-4 h-4 text-primary-600" />
                    <h3 className="font-semibold text-secondary-900">Filtros Avanzados</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Buscador */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto o nº pedido..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input w-full !pl-10 text-sm"
                        />
                    </div>

                    {/* Fechas */}
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="input w-full text-sm"
                            placeholder="Desde"
                        />
                        <span className="text-secondary-400">-</span>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="input w-full text-sm"
                            placeholder="Hasta"
                        />
                    </div>

                    {/* Rango Precio */}
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min €"
                            value={rangoPrecio.min}
                            onChange={(e) => setRangoPrecio({ ...rangoPrecio, min: e.target.value })}
                            className="input w-full text-sm"
                        />
                        <span className="text-secondary-400">-</span>
                        <input
                            type="number"
                            placeholder="Max €"
                            value={rangoPrecio.max}
                            onChange={(e) => setRangoPrecio({ ...rangoPrecio, max: e.target.value })}
                            className="input w-full text-sm"
                        />
                    </div>

                    {/* Limpiar */}
                    <button
                        onClick={() => {
                            setBusqueda('');
                            setFechaInicio('');
                            setFechaFin('');
                            setRangoPrecio({ min: '', max: '' });
                        }}
                        className="btn-outline text-sm justify-center text-secondary-500 hover:text-secondary-700"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Lista de Pedidos */}
            <div className="space-y-4">
                {pedidosFiltrados.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed rounded-lg border-secondary-200 text-secondary-500">
                        No se encontraron pedidos con estos filtros.
                    </div>
                ) : (
                    pedidosFiltrados.map((pedido) => (
                        <div key={pedido.id} className="card overflow-hidden transition-all hover:shadow-md border border-secondary-200">
                            {/* Cabecera del Pedido */}
                            <div
                                onClick={() => togglePedido(pedido.id)}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer bg-secondary-50 hover:bg-white transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${pedidosExpandidos.has(pedido.id) ? 'bg-primary-100 text-primary-600' : 'bg-white text-secondary-400'}`}>
                                        {pedidosExpandidos.has(pedido.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-secondary-900">{pedido.numero}</h3>
                                        <div className="flex flex-col text-sm text-secondary-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                <span>Creado: {new Date(pedido.fecha).toLocaleDateString()} {new Date(pedido.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {pedido.fechaEntrega && (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckSquare className="w-3 h-3" />
                                                    <span>Entregado: {new Date(pedido.fechaEntrega).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 sm:mt-0">
                                    <span className="text-sm px-3 py-1 rounded-full bg-white border border-secondary-200 text-secondary-700 font-medium">
                                        {pedido.estado.replace(/_/g, ' ')}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-primary-700">{formatearPrecio(pedido.total)}</p>
                                        {pedido.descuento > 0 && <p className="text-xs text-green-600 font-medium">Dto. {pedido.descuento}%</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Detalles del Pedido (Expandible) */}
                            {pedidosExpandidos.has(pedido.id) && (
                                <div className="border-t border-secondary-200 divide-y divide-secondary-100 animate-fade-in">
                                    {/* Cabecera Tabla */}
                                    <div className="grid grid-cols-12 gap-4 p-3 bg-secondary-50/50 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                                        <div className="col-span-5">Producto</div>
                                        <div className="col-span-2 text-center">Cant.</div>
                                        <div className="col-span-2 text-right">Precio Ud.</div>
                                        <div className="col-span-1 text-center">Dto</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>

                                    {/* Lineas */}
                                    {pedido.lineas.map((linea, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-primary-50/30 transition-colors">
                                            <div className="col-span-5">
                                                <div
                                                    className={`flex items-center gap-3 ${linea.vino ? 'cursor-pointer hover:bg-secondary-100 p-1 rounded transition-colors group' : ''}`}
                                                    onClick={(e) => {
                                                        if (linea.vino) {
                                                            e.stopPropagation();
                                                            setVinoSeleccionado(linea.vino);
                                                        }
                                                    }}
                                                    title={linea.vino ? "Ver ficha técnica del vino" : ""}
                                                >
                                                    <div className="p-2 bg-secondary-100 rounded text-secondary-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                        <Package className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className={`font-medium ${linea.vino ? 'text-primary-800 underline decoration-dotted decoration-primary-300' : 'text-secondary-900'}`}>
                                                            {linea.vinoNombre}
                                                        </p>
                                                        {linea.anada && <span className="text-xs text-secondary-500">Añada {linea.anada}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center">
                                                <div className="font-medium text-secondary-900">
                                                    {linea.cantidad}
                                                    <span className="text-xs text-secondary-500 ml-1">bots</span>
                                                </div>
                                                {linea.cantidadBultos && (
                                                    <div className="text-xs text-secondary-400">
                                                        {linea.cantidadBultos} {linea.tipoBulto === 'CAJA' ? 'Cajas' : 'Bultos'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-span-2 text-right text-secondary-600 font-mono text-sm">
                                                {formatearPrecio(linea.precioUnitario)}
                                            </div>
                                            <div className="col-span-1 text-center text-xs font-medium text-secondary-500">
                                                {linea.descuento > 0 ? <span className="text-green-600">-{linea.descuento}%</span> : '-'}
                                            </div>
                                            <div className="col-span-2 text-right font-bold text-secondary-900 font-mono text-sm">
                                                {formatearPrecio(linea.subtotal)}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Footer Detalles (Impuestos, envio, etc si hubiera) */}
                                    <div className="p-3 bg-secondary-50 flex justify-end gap-6 text-sm text-secondary-600">
                                        <span>Subtotal: {formatearPrecio(pedido.subtotal)}</span>
                                        <span>IVA ({pedido.iva}%): {formatearPrecio((pedido.total - pedido.subtotal))}</span>
                                        <span className="font-bold text-secondary-900">Total: {formatearPrecio(pedido.total)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Detalle de Vino */}
            {vinoSeleccionado && (
                <VinoDetalleModal
                    vino={vinoSeleccionado}
                    onClose={() => setVinoSeleccionado(null)}
                />
            )}
        </div>
    );
};

