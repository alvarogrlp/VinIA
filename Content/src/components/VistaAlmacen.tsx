import { useState, useMemo } from 'react';
import { Package, FileText, MapPin, Calendar, ArrowRight, Printer, Search, Download, CheckSquare } from 'lucide-react';
import { usePedidosStore, useClientesStore } from '../store';
import type { Pedido, EstadoPedido } from '../types';
import { PedidoModal } from './PedidoModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const VistaAlmacen = () => {
    const { pedidos, cambiarEstadoPedido, marcarAlbaranDescargado } = usePedidosStore();
    const { clientes } = useClientesStore();
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

    // Filtros y Búsqueda
    const [filtroEstado, setFiltroEstado] = useState<'Pendiente' | 'Confirmado' | 'En Reparto' | 'Albaranes Pendientes' | 'Todos'>('Todos');
    const [busqueda, setBusqueda] = useState('');

    // Hoja de Carga
    const [mostrarHojaCarga, setMostrarHojaCarga] = useState(false);
    const [zonaSeleccionada, setZonaSeleccionada] = useState<'Norte' | 'Sur' | 'Santa Cruz'>('Norte');
    const [pedidosSeleccionados, setPedidosSeleccionados] = useState<string[]>([]);

    // Filter logic
    const pedidosFiltrados = useMemo(() => {
        let filtered = pedidos.filter(p =>
            // Broaden filter to ensure we capture all relevant states for warehouse
            ['Pendiente', 'PENDIENTE_VALIDACION', 'En Preparación', 'EN_PREPARACION',
                'Listo para Reparto', 'LISTO_PARA_REPARTO',
                'Enviado', 'ENVIADO',
                'En Reparto', 'EN_REPARTO'].includes(p.estado)
        );

        // Apply Tab Filter
        if (filtroEstado === 'Pendiente') {
            filtered = filtered.filter(p => ['Pendiente', 'PENDIENTE_VALIDACION', 'En Preparación', 'EN_PREPARACION'].includes(p.estado));
        } else if (filtroEstado === 'Confirmado') {
            filtered = filtered.filter(p => ['Listo para Reparto', 'LISTO_PARA_REPARTO'].includes(p.estado));
        } else if (filtroEstado === 'En Reparto') {
            filtered = filtered.filter(p => ['En Reparto', 'EN_REPARTO', 'Enviado', 'ENVIADO'].includes(p.estado));
        } else if (filtroEstado === 'Albaranes Pendientes') {
            filtered = filtered.filter(p => ['Listo para Reparto', 'LISTO_PARA_REPARTO'].includes(p.estado) && !p.albaranDescargado);
        }

        // Apply Search
        if (busqueda) {
            const term = busqueda.toLowerCase();
            filtered = filtered.filter(p =>
                p.numero.toLowerCase().includes(term) ||
                (p.clienteNombre || '').toLowerCase().includes(term) ||
                p.cliente?.cif?.toLowerCase().includes(term)
            );
        }

        return filtered.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }, [pedidos, filtroEstado, busqueda]);

    // Pedidos filtrados por zona para la Hoja de Carga - SOLO CONFIRMADOS (Listos para reparto)
    const pedidosPorZona = useMemo(() => {
        return pedidos.filter(p => {
            const cliente = clientes.find(c => c.id === p.clienteId);
            // Solo pedidos listos para reparto (Confirmados)
            const esListo = ['Listo para Reparto', 'LISTO_PARA_REPARTO'].includes(p.estado);
            return esListo && cliente && (cliente as any).zona === zonaSeleccionada;
        }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()); // Oldest first
    }, [pedidos, clientes, zonaSeleccionada]);


    const handleEstado = async (id: string, nuevoEstado: EstadoPedido) => {
        if (window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) {
            try {
                await cambiarEstadoPedido(id, nuevoEstado);
            } catch (error: any) {
                alert('Error: ' + error.message);
            }
        }
    };

    const generarAlbaran = async (pedido: Pedido) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('ALBARÁN DE ENTREGA', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Pedido: ${pedido.numero}`, 14, 30);
        doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`, 14, 35);

        // Cliente
        doc.text('DATOS CLIENTE:', 14, 45);
        doc.setFontSize(12);
        doc.text(pedido.clienteNombre || '', 14, 52);
        doc.setFontSize(10);
        doc.text(`CIF: ${pedido.cliente?.cif || ''}`, 14, 58);
        doc.text(`Dirección: ${pedido.direccionEntrega || ''}`, 14, 64);

        // Tabla Productos
        const tableData = pedido.lineas.map(l => [
            l.vinoNombre || '',
            l.tipoBulto || 'Botella',
            l.cantidad || 0,
        ]);

        autoTable(doc, {
            startY: 75,
            head: [['Producto', 'Formato', 'Cantidad']],
            body: tableData,
        });

        // Space for signature
        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.text('Recibí Conforme:', 14, finalY + 30);
        doc.line(14, finalY + 50, 80, finalY + 50); // Signature line
        doc.text('Firma y Fecha', 14, finalY + 55);

        doc.save(`Albaran_${pedido.numero}.pdf`);

        // Mark as downloaded
        if (!pedido.albaranDescargado) {
            await marcarAlbaranDescargado(pedido.id);
        }
    };

    const generarHojaCarga = async () => {
        const seleccion = pedidosPorZona.filter(p => pedidosSeleccionados.includes(p.id));

        if (seleccion.length === 0) {
            alert('Seleccione al menos un pedido');
            return;
        }

        // 1. Agrupar productos
        const resumenCarga: Record<string, { nombre: string, cantidad: number }> = {};

        seleccion.forEach(pedido => {
            pedido.lineas.forEach(linea => {
                if (!resumenCarga[linea.vinoId]) {
                    resumenCarga[linea.vinoId] = {
                        nombre: linea.vinoNombre || 'Vino desconocido',
                        cantidad: 0
                    };
                }
                resumenCarga[linea.vinoId].cantidad += linea.cantidad;
            });
        });

        // 2. Generar PDF
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`HOJA DE CARGA - ZONA ${zonaSeleccionada.toUpperCase()}`, 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
        doc.text(`Total Pedidos: ${seleccion.length}`, 14, 40);

        const tableData = Object.values(resumenCarga).map(item => [
            item.nombre,
            item.cantidad + ' botellas'
        ]);

        autoTable(doc, {
            startY: 50,
            head: [['Producto', 'Cantidad Total a Cargar']],
            body: tableData,
        });

        doc.save(`HojaCarga_${zonaSeleccionada}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);

        // 3. Cambiar estado a 'En Reparto'
        if (window.confirm(`Se ha generado la hoja de carga. ¿Desea pasar los ${seleccion.length} pedidos a estado "En Reparto"?`)) {
            for (const pedido of seleccion) {
                await cambiarEstadoPedido(pedido.id, 'EN_REPARTO' as any);
            }
            // Clear selection or refresh
            setPedidosSeleccionados([]);
            setMostrarHojaCarga(false);
        }
    };

    const getSiguienteEstado = (estadoActual: EstadoPedido): { label: string; estado: EstadoPedido; color: string } | null => {
        const estado = estadoActual.toString().toUpperCase().replace(/_/g, ' ');

        if (estado === 'EN PREPARACION') return { label: 'Listo para Reparto', estado: 'LISTO_PARA_REPARTO' as any, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' };
        if (estado === 'LISTO PARA REPARTO') return { label: 'Enviar (En Reparto)', estado: 'EN_REPARTO' as any, color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' };
        if (estado === 'EN REPARTO') return { label: 'Entregado', estado: 'ENTREGADO' as any, color: 'bg-green-100 text-green-800 hover:bg-green-200' };

        return null;
    };

    const getBorderColor = (estado: EstadoPedido) => {
        const e = estado.toString().toUpperCase();
        if (e.includes('PREPARACION')) return 'border-l-4 border-l-blue-500';
        if (e.includes('LISTO')) return 'border-l-4 border-l-yellow-500';
        if (e.includes('ENVIADO')) return 'border-l-4 border-l-purple-500';
        if (e.includes('REPARTO')) return 'border-l-4 border-l-purple-500';
        return 'border-l-4 border-l-gray-300';
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-secondary-900">
                        Cola de Trabajo - Almacén
                    </h2>
                    <p className="text-sm text-secondary-500">Gestión de preparación y envíos</p>
                </div>
                <button
                    onClick={() => setMostrarHojaCarga(!mostrarHojaCarga)}
                    className="btn-primary"
                >
                    <Printer className="w-5 h-5 mr-2" />
                    {mostrarHojaCarga ? 'Volver al Tablero' : 'Generar Hoja de Carga'}
                </button>
            </div>

            {mostrarHojaCarga ? (
                // Vista HOJA DE CARGA
                <div className="card p-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">Generar Hoja de Carga (Pedidos Listos)</h3>

                    <div className="flex items-center gap-4 mb-6">
                        <label className="font-medium">Zona:</label>
                        <select
                            value={zonaSeleccionada}
                            onChange={(e) => setZonaSeleccionada(e.target.value as any)}
                            className="input w-48"
                        >
                            <option value="Norte">Norte</option>
                            <option value="Sur">Sur</option>
                            <option value="Santa Cruz">Santa Cruz</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="table w-full">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="p-3 w-10">Select</th>
                                    <th className="p-3 text-left">Pedido</th>
                                    <th className="p-3 text-left">Cliente</th>
                                    <th className="p-3 text-left">Dirección</th>
                                    <th className="p-3 text-left">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {pedidosPorZona.map(p => (
                                    <tr key={p.id}>
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                                                checked={pedidosSeleccionados.includes(p.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setPedidosSeleccionados([...pedidosSeleccionados, p.id]);
                                                    else setPedidosSeleccionados(pedidosSeleccionados.filter(id => id !== p.id));
                                                }}
                                            />
                                        </td>
                                        <td className="p-3 font-mono text-sm">{p.numero}</td>
                                        <td className="p-3">{p.clienteNombre}</td>
                                        <td className="p-3 text-sm text-secondary-600">{p.direccionEntrega || ''}</td>
                                        <td className="p-3 text-sm">{new Date(p.fecha).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {pedidosPorZona.length === 0 && (
                                    <tr><td colSpan={5} className="p-6 text-center text-secondary-500">No hay pedidos listos en esta zona.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={generarHojaCarga}
                            disabled={pedidosSeleccionados.length === 0}
                            className="btn-primary disabled:opacity-50"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Generar Hoja y Pasar a Reparto
                        </button>
                    </div>
                </div>
            ) : (
                // Vista TABLERO (Dashboard)
                <>
                    {/* Filtros y Buscador */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {['Todos', 'Pendiente', 'Confirmado', 'Albaranes Pendientes', 'En Reparto'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFiltroEstado(f as any)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filtroEstado === f
                                            ? 'bg-primary-100 text-primary-800'
                                            : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                                        }`}
                                >
                                    {f === 'Pendiente' ? 'En Prep.' : f}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                            <input
                                type="text"
                                placeholder="Buscar pedido..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="input w-full pl-9 py-2 text-sm"
                            />
                        </div>
                    </div>

                    {/* Grid de Pedidos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pedidosFiltrados.map(pedido => {
                            const siguienteAccion = getSiguienteEstado(pedido.estado);
                            // Permitir descargar albarán solo si está en Listo para Reparto o estados posteriores
                            const puedeDescargarAlbaran = ['Listo para Reparto', 'LISTO_PARA_REPARTO', 'En Reparto', 'EN_REPARTO', 'Enviado', 'ENVIADO'].includes(pedido.estado);

                            return (
                                <div key={pedido.id} className={`bg-white rounded-lg shadow-sm border border-secondary-200 p-5 hover:shadow-md transition-shadow ${getBorderColor(pedido.estado)}`}>
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-secondary-900">{pedido.clienteNombre}</h3>
                                            <div className="flex items-center text-sm text-secondary-600 mt-1">
                                                <MapPin className="w-4 h-4 mr-1 text-secondary-400" />
                                                <span>{pedido.direccionEntrega || 'Dirección desconocida'}</span>
                                            </div>
                                            <div className="flex flex-col text-xs text-secondary-500 mt-2 gap-1">
                                                <span>Pago: {pedido.formaPago || 'No definido'}</span>
                                                {pedido.usuario && (
                                                    <span>Comercial: {pedido.usuario.nombre} {pedido.usuario.apellidos}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs font-mono bg-secondary-100 px-2 py-1 rounded">
                                                {pedido.numero}
                                            </span>
                                            {/* Status check for albaran */}
                                            {pedido.albaranDescargado && (
                                                <div className="group relative">
                                                    <CheckSquare className="w-4 h-4 text-green-600 cursor-help" />
                                                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                                                        Descargado: {pedido.fechaDescargaAlbaran ? new Date(pedido.fechaDescargaAlbaran).toLocaleString() : 'Sí'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Products List */}
                                    <div className="bg-secondary-50 rounded-lg p-3 mb-4 space-y-2 max-h-48 overflow-y-auto">
                                        {pedido.lineas.map((linea, idx) => (
                                            <div key={idx} className="text-sm flex justify-between items-center border-b border-secondary-200 last:border-0 pb-1 last:pb-0">
                                                <div className="flex-1">
                                                    <span className="font-medium text-secondary-800">{linea.vinoNombre}</span>
                                                    <div className="text-xs text-secondary-500">
                                                        {linea.anada ? `Añada ${linea.anada}` : ''} {linea.tipoBulto || 'Botella'}
                                                    </div>
                                                </div>
                                                <div className="font-bold text-secondary-900 pl-2">
                                                    x{linea.cantidad}
                                                </div>
                                            </div>
                                        ))}
                                        {pedido.lineas.length === 0 && <span className="text-xs text-red-500">Sin productos cargados</span>}
                                    </div>

                                    {/* Footer / Actions */}
                                    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-secondary-100">
                                        <div className="flex justify-between items-center text-xs text-secondary-500 mb-2">
                                            <span className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(pedido.fecha).toLocaleDateString()}
                                            </span>
                                            <span className="font-medium px-2 py-0.5 rounded bg-gray-100">
                                                {pedido.estado.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setPedidoSeleccionado(pedido)}
                                                className="col-span-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-md hover:bg-secondary-50"
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                Detalles
                                            </button>

                                            {/* Action Button Logic */}
                                            {/* If Ready for Delivery, Show Albaran Button primarily, or 'Send' button if Albaran is done? The user requested Albaran button always there but enabled conditionally. */}
                                            <button
                                                onClick={() => generarAlbaran(pedido)}
                                                disabled={!puedeDescargarAlbaran}
                                                className={`col-span-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white rounded-md transition-colors 
                                                ${!puedeDescargarAlbaran
                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                        : pedido.albaranDescargado
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : 'bg-secondary-600 hover:bg-secondary-700'
                                                    }`}
                                                title={!puedeDescargarAlbaran ? 'Debe estar confirmado (Listo para Reparto)' : ''}
                                            >
                                                {pedido.albaranDescargado ? <CheckSquare className="w-4 h-4 mr-1" /> : <Download className="w-4 h-4 mr-1" />}
                                                {pedido.albaranDescargado ? 'Albarán OK' : 'Albarán'}
                                            </button>
                                        </div>

                                        {/* Optional: Separate State Advance Button if needed, or keep it integrated. User asked to change state when Loading Sheet is generated. 
                                        But individal advancement is also useful. Keeping the "Next State" button if valid transition exists? 
                                        Let's keep the standard Workflow button below if available and desired.
                                    */}
                                        {siguienteAccion && (
                                            <button
                                                onClick={() => handleEstado(pedido.id, siguienteAccion.estado)}
                                                className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md ${siguienteAccion.color}`}
                                            >
                                                <span>{siguienteAccion.label}</span>
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </button>
                                        )}

                                    </div>
                                </div>
                            );
                        })}

                        {pedidosFiltrados.length === 0 && (
                            <div className="col-span-full py-12 text-center text-secondary-500 bg-secondary-50 rounded-lg border border-dashed border-secondary-300">
                                <Package className="w-12 h-12 mx-auto mb-3 text-secondary-400" />
                                <p>No se encontraron pedidos con los filtros actuales.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {pedidoSeleccionado && (
                <PedidoModal
                    pedido={pedidoSeleccionado}
                    onClose={() => setPedidoSeleccionado(null)}
                    onCambiarEstado={handleEstado}
                    rol="Almacén"
                />
            )}
        </div>
    );
};
