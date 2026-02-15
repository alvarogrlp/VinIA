/**
 * VinIA - Histórico Profesional de Cliente
 * 
 * Vista detallada de todos los pedidos de un cliente con filtros avanzados
 * y visualización desglosada para análisis de hábitos de compra.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Filter, ChevronDown, ChevronUp, Package, CheckSquare } from 'lucide-react';
import { useClientesStore, usePedidosStore, useAuthStore } from '../store';
import { api } from '../lib/api';
import { formatearPrecio } from '../utils/helpers';
import type { Pedido, Vino } from '../types';
import { VinoDetalleModal } from '../components/VinoDetalleModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const HistoricoCliente = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { usuario } = useAuthStore();
    const { clientes, cargarClientes } = useClientesStore();
    const { cambiarEstadoPedido } = usePedidosStore();

    const esCancelable = (estado: string) => {
        if (!estado) return false;
        const s = estado.toUpperCase().replace(/_/g, ' ').replace(/Á/g, 'A').replace(/Ó/g, 'O').trim();
        return ['PENDIENTE VALIDACION', 'PENDIENTE', 'BORRADOR', 'PENDIENTE DE VALIDACION'].includes(s);
    };

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [cargando, setCargando] = useState(true);
    const [vinoSeleccionado, setVinoSeleccionado] = useState<Vino | null>(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

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

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

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

    const handleCancelarPedido = (e: React.MouseEvent, pedidoId: string) => {
        e.stopPropagation();
        showConfirm('Cancelar Pedido', '¿Está seguro de que desea cancelar este pedido? El stock será devuelto.', async () => {
            try {
                await cambiarEstadoPedido(pedidoId, 'CANCELADO' as any);
                await cargarHistorial(); // Refrescar lista
            } catch (error) {
                console.error('Error al cancelar pedido', error);
            }
        });
    };

    const handleRepetirPedido = (pedido: Pedido) => {
        // Navegar a nuevo pedido pasando los datos del pedido actual
        // Mapeamos las líneas al formato esperado por agregarLineaPedido
        const lineasParaRepetir = pedido.lineas.map(l => ({
            vinoId: l.vino?.id || l.vinoId, // Intentar obtener ID si está disponible
            vinoNombre: l.vinoNombre,
            cantidad: l.cantidad,
            precioUnitario: l.precioUnitario,
            descuento: l.descuento || 0,
            subtotal: l.subtotal || 0,
            anada: l.anada,
            tipoBulto: l.tipoBulto || 'BOTELLA',
            cantidadBultos: l.cantidadBultos || l.cantidad,
            vino: l.vino // Pasamos objeto vino completo si existe
        }));

        navigate('/pedidos/nuevo', {
            state: {
                clienteId: cliente?.id,
                lineas: lineasParaRepetir,
                direccionEnvio: pedido.direccionEnvioSnapshot,
                instrucciones: pedido.instruccionesEntrega
            }
        });
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {/* Buscador */}
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Buscar producto o nº pedido..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="input w-full text-sm"
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-2 lg:col-span-2">
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="input w-full text-sm"
                            placeholder="Desde"
                        />
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
                        className="btn-outline !px-2 w-fit text-sm justify-center text-secondary-500 hover:text-secondary-700 h-10"
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
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer bg-secondary-50 hover:bg-white transition-colors gap-4"
                            >
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className={`p-2 rounded-full shrink-0 ${pedidosExpandidos.has(pedido.id) ? 'bg-primary-100 text-primary-600' : 'bg-white text-secondary-400'}`}>
                                        {pedidosExpandidos.has(pedido.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start sm:block">
                                            <h3 className="font-bold text-secondary-900 truncate">{pedido.numero}</h3>
                                            <span className="sm:hidden text-xs px-2 py-0.5 rounded-full bg-white border border-secondary-200 text-secondary-700 font-medium whitespace-nowrap ml-2">
                                                {pedido.estado.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-sm text-secondary-500">
                                            <div className="flex items-center gap-2 truncate">
                                                <Calendar className="w-3 h-3 shrink-0" />
                                                <span className="truncate">Creado: {new Date(pedido.fecha).toLocaleDateString()}</span>
                                            </div>
                                            {pedido.fechaEntrega && (
                                                <div className="flex items-center gap-2 text-green-600 truncate">
                                                    <CheckSquare className="w-3 h-3 shrink-0" />
                                                    <span className="truncate">Entregado: {new Date(pedido.fechaEntrega).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-secondary-200">
                                    <div className="flex items-center gap-2">
                                        {(usuario?.rol === 'Comercial' || usuario?.rol === 'Administración') && esCancelable(pedido.estado) && (
                                            <button
                                                onClick={(e) => handleCancelarPedido(e, pedido.id)}
                                                className="text-xs px-3 py-1.5 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-sm"
                                            >
                                                CANCELAR
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRepetirPedido(pedido);
                                            }}
                                            className="text-xs sm:text-sm px-3 py-1 rounded-full bg-primary-100 text-primary-700 font-medium hover:bg-primary-200 transition-colors whitespace-nowrap"
                                        >
                                            Repetir
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="hidden sm:inline-block text-sm px-3 py-1 rounded-full bg-white border border-secondary-200 text-secondary-700 font-medium">
                                            {pedido.estado.replace(/_/g, ' ')}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary-700">{formatearPrecio(pedido.total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles del Pedido (Expandible) */}
                            {pedidosExpandidos.has(pedido.id) && (
                                <div className="border-t border-secondary-200 animate-fade-in bg-white">
                                    {/* HEADERS (Desktop Only) */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 p-3 bg-secondary-50/50 text-xs font-semibold text-secondary-500 uppercase tracking-wider border-b border-secondary-100">
                                        <div className="col-span-5">Producto</div>
                                        <div className="col-span-2 text-center">Cant.</div>
                                        <div className="col-span-2 text-right">Precio Ud.</div>
                                        <div className="col-span-1 text-center">Dto</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="divide-y divide-secondary-100">
                                        {pedido.lineas.map((linea, idx) => (
                                            <div key={idx} className="hover:bg-primary-50/30 transition-colors">
                                                {/* Desktop Row */}
                                                <div className="hidden md:grid grid-cols-12 gap-4 p-4 items-center">
                                                    <div className="col-span-5">
                                                        <div className={`flex items-center gap-3 ${linea.vino ? 'cursor-pointer hover:bg-secondary-100 p-1 rounded transition-colors group' : ''}`}
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

                                                {/* Mobile Row */}
                                                <div className="md:hidden p-4 flex flex-col gap-3">
                                                    {/* Header: Product Name */}
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-secondary-100 rounded text-secondary-500 shrink-0 mt-0.5">
                                                            <Package className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-secondary-900 leading-tight">
                                                                {linea.vinoNombre}
                                                            </p>
                                                            {linea.anada && <span className="text-xs text-secondary-500">Añada {linea.anada}</span>}
                                                        </div>
                                                    </div>

                                                    {/* Details Grid */}
                                                    <div className="grid grid-cols-3 gap-2 text-xs bg-secondary-50 rounded-lg p-3">
                                                        <div className="flex flex-col items-center border-r border-secondary-200">
                                                            <span className="text-secondary-400 mb-0.5 uppercase text-[10px]">Cantidad</span>
                                                            <span className="font-bold text-secondary-900">{linea.cantidad} bots</span>
                                                            {linea.cantidadBultos && <span className="text-[10px] text-secondary-500">({linea.cantidadBultos} {linea.tipoBulto === 'CAJA' ? 'Cajas' : 'Bultos'})</span>}
                                                        </div>
                                                        <div className="flex flex-col items-center border-r border-secondary-200">
                                                            <span className="text-secondary-400 mb-0.5 uppercase text-[10px]">Precio Ud.</span>
                                                            <span className="font-medium text-secondary-900">{formatearPrecio(linea.precioUnitario)}</span>
                                                            {linea.descuento > 0 && <span className="text-[10px] text-green-600">-{linea.descuento}% Dto.</span>}
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center">
                                                            <span className="text-secondary-400 mb-0.5 uppercase text-[10px]">Subtotal</span>
                                                            <span className="font-bold text-primary-700 text-sm">{formatearPrecio(linea.subtotal)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer Detalles */}
                                    <div className="p-4 bg-secondary-50 border-t border-secondary-200 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-6 text-sm text-secondary-600 items-end sm:items-center">
                                        <div className="flex justify-between w-full sm:w-auto gap-4">
                                            <span>Subtotal:</span>
                                            <span className="font-medium">{formatearPrecio(pedido.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between w-full sm:w-auto gap-4">
                                            <span>IVA ({pedido.iva}%):</span>
                                            <span className="font-medium">{formatearPrecio((pedido.total - pedido.subtotal))}</span>
                                        </div>
                                        <div className="flex justify-between w-full sm:w-auto gap-4 border-t sm:border-0 border-secondary-200 pt-2 sm:pt-0 mt-1 sm:mt-0">
                                            <span className="font-bold text-secondary-900 text-base">Total:</span>
                                            <span className="font-bold text-primary-700 text-lg">{formatearPrecio(pedido.total)}</span>
                                        </div>
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

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />
        </div>
    );
};

