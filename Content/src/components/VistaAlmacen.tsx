import { useState, useMemo } from 'react';
import { Package, FileText, MapPin, Calendar, ArrowRight, Printer, Search, Download, CheckSquare } from 'lucide-react';
import { usePedidosStore, useClientesStore } from '../store';
import type { Pedido, EstadoPedido } from '../types';
import { PedidoModal } from './PedidoModal';
import { ConfirmModal } from './ConfirmModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const VistaAlmacen = () => {
    const { pedidos, cambiarEstadoPedido, marcarAlbaranDescargado } = usePedidosStore();
    const { clientes } = useClientesStore();
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type?: 'info' | 'warning' | 'danger' | 'success';
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        onCancel?: () => void;
        showCancel?: boolean;
    }>({
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const showModal = (config: typeof modalConfig) => {
        setModalConfig(config);
        setModalOpen(true);
    };

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
        showModal({
            title: 'Confirmar Cambio de Estado',
            message: `¿Está seguro de que desea cambiar el estado del pedido a ${nuevoEstado}?`,
            type: 'warning',
            onConfirm: async () => {
                try {
                    await cambiarEstadoPedido(id, nuevoEstado);
                } catch (error: any) {
                    showModal({
                        title: 'Error',
                        message: 'Error al cambiar estado: ' + error.message,
                        type: 'danger',
                        onConfirm: () => { }
                    });
                }
            }
        });
    };

    const doGenerarAlbaran = async (pedido: Pedido, mostrarPrecios: boolean) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text(mostrarPrecios ? 'ALBARÁN DE ENTREGA' : 'NOTA DE ENTREGA', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Pedido: ${pedido.numero}`, 14, 30);
        doc.text(`Fecha: ${new Date(pedido.fecha).toLocaleDateString()}`, 14, 35);
        doc.text(`Forma de Pago: ${pedido.formaPago || 'Contado'}`, 14, 40);

        // Cliente
        doc.text('DATOS CLIENTE:', 14, 50);
        doc.setFontSize(12);
        doc.text(pedido.clienteNombre || '', 14, 57);
        doc.setFontSize(10);
        doc.text(`CIF: ${pedido.cliente?.cif || ''}`, 14, 63);
        doc.text(`Dirección: ${pedido.direccionEntrega || ''}`, 14, 69);

        // Tabla Productos Headers
        const head = [['Producto', 'Formato', 'Cantidad']];
        if (mostrarPrecios) {
            head[0].push('P. Unit.', 'Dto %', 'Total');
        }

        // Tabla Productos Body
        const tableData = pedido.lineas.map(l => {
            const row = [
                l.vinoNombre || '',
                l.tipoBulto || 'Botella',
                l.cantidad || 0,
            ];
            if (mostrarPrecios) {
                row.push((l.precioUnitario || 0).toFixed(2) + '€');
                // Use line discount if available, otherwise order discount, or 0
                const dto = l.descuento || pedido.descuento || 0;
                row.push(dto > 0 ? `${dto}%` : '-');
                row.push((l.subtotal || 0).toFixed(2) + '€');
            }
            return row;
        });

        autoTable(doc, {
            startY: 80,
            head: head,
            body: tableData,
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;

        // Totales (Solo si mostrarPrecios es true)
        if (mostrarPrecios) {
            // El subtotal ya incluye los descuentos aplicados linea por linea o globalmente en el store
            // Si queremos mostrar el total final limpio:

            // Calculamos base imponible real sumando los subtotales de linea (que ya tienen dto aplicado)
            // Si pedido.subtotal del backend viene "bruto", usaríamos la suma de lineas.
            // Asumiendo que pedido.subtotal ya tiene el descuento aplicado si es global en backend, O BIEN
            // recalculamos para asegurar consistencia con la tabla:
            const baseImponible = pedido.lineas.reduce((acc, l) => acc + (l.subtotal || 0), 0);

            const porcentajeIva = pedido.iva || 0;
            const montoIva = baseImponible * (porcentajeIva / 100);
            const total = baseImponible + montoIva;

            doc.text(`Subtotal: ${baseImponible.toFixed(2)}€`, 140, finalY);
            doc.text(`Impuestos (${porcentajeIva}%): ${montoIva.toFixed(2)}€`, 140, finalY + 5);
            doc.setFontSize(12);
            doc.text(`TOTAL: ${total.toFixed(2)}€`, 140, finalY + 12);
            doc.setFontSize(10);
        }

        // Space for signature
        doc.text('Recibí Conforme:', 14, finalY + 30);
        doc.line(14, finalY + 50, 80, finalY + 50); // Signature line
        doc.text('Firma y Fecha', 14, finalY + 55);

        doc.save(`Albaran_${pedido.numero}.pdf`);

        // Mark as downloaded
        if (!pedido.albaranDescargado) {
            await marcarAlbaranDescargado(pedido.id);
        }
    };

    const iniciarGenerarAlbaran = (pedido: Pedido) => {
        const esContado = pedido.formaPago === 'Contado';

        if (esContado) {
            doGenerarAlbaran(pedido, true);
        } else {
            showModal({
                title: 'Formato de Documento',
                message: 'El pedido no es al contado. ¿Cómo desea generar el documento?\n\nPuede ocultar los precios para crear una Nota de Entrega.',
                confirmText: 'Ocultar Precios',
                cancelText: 'Mostrar Precios',
                type: 'info',
                onConfirm: () => doGenerarAlbaran(pedido, false),
                onCancel: () => doGenerarAlbaran(pedido, true)
            });
        }
    };

    const generarHojaCarga = async () => {
        const seleccion = pedidosPorZona.filter(p => pedidosSeleccionados.includes(p.id));

        if (seleccion.length === 0) {
            showModal({
                title: 'Selección requerida',
                message: 'Seleccione al menos un pedido',
                type: 'warning',
                onConfirm: () => { }
            });
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
        showModal({
            title: 'Actualizar Pedidos',
            message: `Se ha generado la hoja de carga correctamente.\n\n¿Desea pasar los ${seleccion.length} pedidos seleccionados al estado "En Reparto"?`,
            confirmText: 'Sí, Actualizar a En Reparto',
            cancelText: 'No, Mantener estado',
            type: 'success',
            onConfirm: async () => {
                try {
                    for (const pedido of seleccion) {
                        await cambiarEstadoPedido(pedido.id, 'EN_REPARTO' as any);
                    }
                    setPedidosSeleccionados([]);
                    setMostrarHojaCarga(false);
                } catch (error: any) {
                    // Nested modals might be tricky if not careful, but state update works
                    alert('Error actualizando estados: ' + error.message); // Fallback or use a toast
                }
            }
        });
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
            <ConfirmModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                showCancel={modalConfig.showCancel}
            />

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
                                className="input w-full !pl-10 py-2 text-sm"
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
                                            <button
                                                onClick={() => iniciarGenerarAlbaran(pedido)}
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
