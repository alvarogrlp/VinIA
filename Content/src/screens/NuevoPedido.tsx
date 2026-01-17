import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  Save,
  User,
  ShoppingCart,
  ArrowLeft,
  History,
  Minus,
  Box,
  CreditCard,
  MapPin,
  FileText,
  Info
} from 'lucide-react';
import { usePedidosStore, useClientesStore, useVinosStore } from '../store';
import { api } from '../lib/api';
import { formatearPrecio } from '../utils/helpers';
import { ConfirmModal } from '../components/ConfirmModal';
import { VinoDetalleModal } from '../components/VinoDetalleModal';
import { Select } from '../components';
import type { Vino } from '../types';

export const NuevoPedido = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    pedidoActual,
    crearPedido,
    agregarLineaPedido,
    eliminarLineaPedido,
    actualizarLineaPedido,
    setDescuento,
    setIva,
    actualizarPedido,
    guardarPedido,
    cancelarPedido,
    cargando: cargandoPedido
  } = usePedidosStore();

  const { clientes, cargarClientes } = useClientesStore();
  const { vinos, cargarVinos, buscarVinos, cargando: cargandoVinos } = useVinosStore();

  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaVino, setBusquedaVino] = useState('');
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string | null>(null);

  // Historial de productos
  const [productosHabituales, setProductosHabituales] = useState<any[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'danger' | 'success',
    onConfirm: () => { }
  });

  // Wine Detail Modal
  const [vinoDetalle, setVinoDetalle] = useState<Vino | null>(null);

  const showModal = (title: string, message: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info', onConfirm: () => void = () => setModalOpen(false)) => {
    setModalConfig({ title, message, type, onConfirm });
    setModalOpen(true);
  };

  useEffect(() => {
    cargarClientes();
    cargarVinos(); // Reset catalog to full list initially

    if (!location.state) {
      cancelarPedido();
    }
  }, []);

  // Use debounced search for wines
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (busquedaVino.trim().length > 0) {
        buscarVinos(busquedaVino);
      } else {
        cargarVinos();
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [busquedaVino]);

  // Handle "Repeat Order"
  const procesadoRef = useRef(false);

  useEffect(() => {
    if (location.state && location.state.clienteId && clientes.length > 0) {
      // Prevent double execution in StrictMode or due to re-renders
      if (procesadoRef.current) return;

      const { clienteId, lineas, direccionEnvio, instrucciones } = location.state;

      // Mark as processed immediately to block subsequent runs
      procesadoRef.current = true;

      setClienteSeleccionadoId(clienteId);
      crearPedido(clienteId);

      setTimeout(() => {
        if (lineas && Array.isArray(lineas)) {
          lineas.forEach((linea: any) => {
            agregarLineaPedido({
              vinoId: linea.vinoId,
              vinoNombre: linea.vinoNombre,
              cantidad: linea.cantidad,
              precioUnitario: linea.precioUnitario,
              descuento: linea.descuento,
              subtotal: linea.subtotal,
              anada: linea.anada,
              tipoBulto: linea.tipoBulto,
              cantidadBultos: linea.cantidadBultos
            });
          });
        }
        if (direccionEnvio) actualizarPedido({ direccionEnvioSnapshot: direccionEnvio });
        if (instrucciones) actualizarPedido({ instruccionesEntrega: instrucciones });

        // Clear state but we keep the processing flag true for this component lifecycle
        window.history.replaceState({}, document.title);
      }, 100);
    }
  }, [location.state, clientes.length]);

  // Load History on Client Select
  useEffect(() => {
    const fetchHistorial = async () => {
      if (!clienteSeleccionadoId) {
        setProductosHabituales([]);
        return;
      }

      try {
        setCargandoHistorial(true);
        const data: any[] = await api.get(`/pedidos?clienteId=${clienteSeleccionadoId}`);
        const stats = new Map();

        data.forEach(pedido => {
          const vinosEnPedido = new Set();
          pedido.lineas.forEach((linea: any) => {
            const nombre = linea.vino?.nombre || linea.vinoNombre || 'Producto desconocido';
            const vinoId = linea.vinoId || linea.vino?.id;
            const key = vinoId || nombre;

            if (vinosEnPedido.has(key)) return;
            vinosEnPedido.add(key);

            if (!stats.has(key)) {
              stats.set(key, {
                id: vinoId,
                nombre: nombre,
                vecesPedido: 0,
                ultimaAnada: linea.anada || linea.vino?.ano,
                imagen: linea.vino?.imagen_url // Try to grab image if available
              });
            }

            const item = stats.get(key);
            item.vecesPedido += 1;
            if (linea.anada) item.ultimaAnada = linea.anada;
          });
        });

        const habituales = Array.from(stats.values())
          .filter(item => item.vecesPedido >= 2)
          .sort((a, b) => b.vecesPedido - a.vecesPedido)
          .slice(0, 6);

        setProductosHabituales(habituales);
      } catch (error) {
        console.error("Error cargando historial", error);
      } finally {
        setCargandoHistorial(false);
      }
    };

    fetchHistorial();
  }, [clienteSeleccionadoId]);

  const handleSeleccionarCliente = (id: string) => {
    setClienteSeleccionadoId(id);
    crearPedido(id);
    setBusquedaCliente('');
  };

  const handleAgregarVino = (vino: any) => {
    if (!pedidoActual) return;

    if (vino.stock <= 0) {
      showModal('Stock Agotado', 'No hay stock disponible para este producto', 'danger');
      return;
    }

    const existe = pedidoActual.lineas.find(l => l.vinoId === vino.id);
    if (existe) {
      if (existe.cantidad + 1 > vino.stock) {
        showModal('Stock Insuficiente', 'No hay suficiente stock para añadir más.', 'warning');
        return;
      }
      actualizarLineaPedido(existe.id, {
        cantidad: existe.cantidad + 1,
        cantidadBultos: (existe.cantidadBultos || 0) + 1
      });
    } else {
      agregarLineaPedido({
        vinoId: vino.id,
        vinoNombre: vino.nombre,
        cantidad: 1,
        precioUnitario: vino.precio_unitario,
        descuento: 0,
        subtotal: vino.precio_unitario,
        anada: vino.ano,
        tipoBulto: 'BOTELLA',
        cantidadBultos: 1
      });
    }
  };

  const handleAgregarDesdeHistorial = (itemHistorial: any) => {
    let vinoEncontraado = vinos.find(v => v.id === itemHistorial.id);
    if (!vinoEncontraado) {
      // If not in current filtered list, we might need to fetch it or warn
      // For now, simple check by name in case it's loaded
      vinoEncontraado = vinos.find(v => v.nombre === itemHistorial.nombre);
    }

    if (vinoEncontraado) {
      handleAgregarVino(vinoEncontraado);
    } else {
      // Fallback: try to find it in the global list if current 'vinos' is filtered? 
      // Since we use the store 'vinos' which IS the source of truth, if it's not there, it might be deactivated.
      showModal('Producto no disponible', 'Este producto no está disponible en la vista actual (puede estar sin stock o desactivado).', 'warning');
    }
  };

  const handleUpdateBultos = (linea: any, nuevoTipo: 'BOTELLA' | 'CAJA', nuevosBultos: number) => {
    // We need to find the wine to check stock/box size. 
    // Ideally we should store wine snapshot in the order line or fetch from store
    const vino = vinos.find(v => v.id === linea.vinoId);
    if (!vino && linea.vino) { /* fallback to snapshot if exists */ }

    // Default to standard 6 if unknown
    const botellasPorBulto = nuevoTipo === 'CAJA' ? (vino?.botellas_por_caja || 6) : 1;
    const totalBotellas = nuevosBultos * botellasPorBulto;
    const stock = vino?.stock || 9999;

    if (totalBotellas > stock) {
      showModal('Stock Insuficiente', `Necesitas ${totalBotellas} botellas, solo hay ${stock} disponibles.`, 'warning');
      return;
    }

    actualizarLineaPedido(linea.id, {
      tipoBulto: nuevoTipo,
      cantidadBultos: nuevosBultos,
      cantidad: totalBotellas
    });
  };

  const handleGuardar = async () => {
    if (!pedidoActual) return;
    try {
      await guardarPedido();
      navigate('/pedidos');
    } catch (error) {
      showModal('Error', (error as Error).message, 'danger');
    }
  };

  // --- RENDER HELPERS ---

  if (!clienteSeleccionadoId) {
    // Legacy Selection Screen (Keep it simple)
    const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) || c.cif.includes(busquedaCliente)).slice(0, 5);
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-8">
        <h1 className="text-3xl font-serif font-bold text-secondary-900 text-center mb-8">Iniciar Nuevo Pedido</h1>
        <div className="card p-8 shadow-xl border-secondary-200">
          <div className="relative mb-6">
            <Search className="absolute w-6 h-6 text-secondary-400 left-4 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Buscar cliente..."
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              className="w-full input text-lg h-14 bg-secondary-50"
              style={{ paddingLeft: '3.5rem' }}
              autoFocus
            />
          </div>
          <div className="space-y-3">
            {clientesFiltrados.map(c => (
              <button key={c.id} onClick={() => handleSeleccionarCliente(c.id)} className="w-full p-4 flex items-center justify-between border border-secondary-200 rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 group-hover:bg-primary-100 group-hover:text-primary-700">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-secondary-900 group-hover:text-primary-900">{c.nombre}</p>
                    <p className="text-secondary-500">{c.ciudad} • {c.cif}</p>
                  </div>
                </div>
                <ArrowLeft className="rotate-180 text-secondary-300 group-hover:text-primary-500" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cliente = clientes.find(c => c.id === clienteSeleccionadoId);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] -m-6 animate-fade-in bg-secondary-50 overflow-hidden">
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        showCancel={false}
        confirmText="Aceptar"
      />

      {vinoDetalle && (
        <VinoDetalleModal
          vino={vinoDetalle}
          onClose={() => setVinoDetalle(null)}
        />
      )}

      {/* TOP HEADER */}
      <div className="bg-white border-b border-secondary-200 p-4 flex items-center justify-between shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => setClienteSeleccionadoId(null)} className="p-2 hover:bg-secondary-100 rounded-full transition-colors text-secondary-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              {cliente?.nombre}
            </h1>
            <p className="text-sm text-secondary-500">{cliente?.direccion}, {cliente?.ciudad}</p>
          </div>
        </div>

        {/* Mobile View Toggle could go here, for now desktop focus */}
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* LEFT COLUMN: CATALOG (70%) */}
        <div className="flex-1 flex flex-col min-w-0 bg-secondary-50/50">
          {/* Search Bar */}
          <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-10">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute w-5 h-5 text-secondary-400 left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar vino (ej: 'Rioja 2018', 'Verdejo')..."
                value={busquedaVino}
                onChange={(e) => setBusquedaVino(e.target.value)}
                className="w-full input shadow-sm border-secondary-300 focus:border-primary-500"
                style={{ paddingLeft: '3.5rem' }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 content-start">
            {/* Productos Habituales */}
            {productosHabituales.length > 0 && !busquedaVino && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" /> Productos Habituales
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                  {productosHabituales.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAgregarDesdeHistorial(item)}
                      className="snap-start min-w-[160px] w-[160px] bg-white p-3 rounded-xl border border-secondary-200 hover:border-primary-500 hover:shadow-md transition-all text-left flex flex-col gap-2 group"
                    >
                      <div className="aspect-square bg-secondary-100 rounded-lg overflow-hidden relative">
                        {item.imagen ? <img src={item.imagen} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-secondary-300"><History className="w-8 h-8" /></div>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">Add +</div>
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 text-sm line-clamp-2 leading-tight">{item.nombre}</p>
                        <p className="text-xs text-secondary-500 mt-1">Pedido {item.vecesPedido} veces</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Catalog Grid */}
            <h3 className="text-sm font-bold text-secondary-500 uppercase tracking-wider mb-3">Catálogo</h3>
            {cargandoVinos ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
                {vinos.map(vino => (
                  <div key={vino.id} onClick={() => handleAgregarVino(vino)} className="group bg-white rounded-xl border border-secondary-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary-300 transition-all flex flex-col">
                    <div className="aspect-[4/5] bg-secondary-100 relative overflow-hidden">
                      {vino.imagen_url ? (
                        <img src={vino.imagen_url} alt={vino.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary-300"><Box className="w-12 h-12" /></div>
                      )}

                      {/* Info Button Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVinoDetalle(vino);
                        }}
                        className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur rounded-full text-secondary-500 hover:text-primary-600 shadow-sm transition-colors z-10"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {vino.stock < (vino.stock_minimo || 10) && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                          {vino.stock === 0 ? 'AGOTADO' : 'POCO STOCK'}
                        </span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
                        <span className="bg-white text-secondary-900 font-bold text-xs py-1 px-3 rounded-full shadow-sm flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Añadir
                        </span>
                      </div>
                    </div>
                    <div className="p-3 flex-1 flex flex-col">
                      <h4 className="font-bold text-secondary-900 leading-tight mb-1">{vino.nombre}</h4>
                      <p className="text-xs text-secondary-500 mb-2 line-clamp-1">{vino.bodega}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-sm font-bold text-primary-700">{formatearPrecio(vino.precio_unitario)}</span>
                        <span className="text-xs text-secondary-400 font-medium bg-secondary-100 px-1.5 py-0.5 rounded">{vino.ano}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {vinos.length === 0 && (
                  <div className="col-span-full py-12 text-center text-secondary-400">
                    <p>No se encontraron vinos que coincidan con la búsqueda.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CART (30% / Fixed Width) */}
        <div className="w-[420px] bg-white border-l border-secondary-200 flex flex-col shadow-2xl z-20 shrink-0">

          {/* Cart Header */}
          <div className="p-4 border-b border-secondary-100 bg-secondary-50 flex items-center justify-between">
            <h2 className="font-bold text-secondary-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
              Carrito
              <span className="bg-primary-100 text-primary-700 text-xs py-0.5 px-2 rounded-full">{pedidoActual?.lineas.length || 0}</span>
            </h2>
            <div className="text-xs text-secondary-500 flex gap-2">
              {pedidoActual?.lineas.length ? <span className="text-amber-600 font-medium">Borrador</span> : <span>Vacío</span>}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {pedidoActual?.lineas.map(linea => {
              const vino = vinos.find(v => v.id === linea.vinoId);
              return (
                <div key={linea.id} className="flex gap-3 relative group">
                  {/* Item Image */}
                  <div className="w-16 h-20 bg-secondary-100 rounded-lg overflow-hidden shrink-0 mt-1">
                    {vino?.imagen_url ? <img src={vino.imagen_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Box className="w-6 h-6 text-secondary-300" /></div>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-secondary-900 line-clamp-2 leading-tight pr-6">{linea.vinoNombre}</h4>
                      <button onClick={() => eliminarLineaPedido(linea.id)} className="text-secondary-300 hover:text-red-500 p-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-xs text-secondary-500 mb-2">{formatearPrecio(linea.precioUnitario)} ud. • {linea.anada}</p>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      {/* Unit Type Toggle */}
                      <div className="flex bg-secondary-100 rounded-lg p-0.5 border border-secondary-200">
                        <button
                          onClick={() => handleUpdateBultos(linea, 'BOTELLA', linea.cantidadBultos || 1)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${linea.tipoBulto !== 'CAJA' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-500 hover:text-secondary-700'
                            }`}
                        >
                          Botella
                        </button>
                        <button
                          onClick={() => handleUpdateBultos(linea, 'CAJA', linea.cantidadBultos || 1)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${linea.tipoBulto === 'CAJA' ? 'bg-white text-primary-700 shadow-sm' : 'text-secondary-500 hover:text-secondary-700'
                            }`}
                        >
                          Caja (x{vino?.botellas_por_caja || 6})
                        </button>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center border border-secondary-200 rounded-lg bg-white overflow-hidden h-7">
                        <button onClick={() => handleUpdateBultos(linea, linea.tipoBulto || 'BOTELLA', Math.max(1, (linea.cantidadBultos || 1) - 1))} className="px-2 hover:bg-secondary-100 h-full flex items-center text-secondary-600"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-medium">{linea.cantidadBultos || linea.cantidad}</span>
                        <button onClick={() => handleUpdateBultos(linea, linea.tipoBulto || 'BOTELLA', (linea.cantidadBultos || 1) + 1)} className="px-2 hover:bg-secondary-100 h-full flex items-center text-secondary-600"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {(!pedidoActual?.lineas || pedidoActual.lineas.length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-secondary-400 space-y-2 opacity-50">
                <ShoppingCart className="w-12 h-12 stroke-1" />
                <p className="text-sm">Carrito vacío</p>
              </div>
            )}
          </div>

          {/* Cart Footer / Summary */}
          <div className="bg-secondary-50 border-t border-secondary-200 p-4 space-y-4">
            {/* Delivery Info Toggle / Compact */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border border-secondary-200 bg-white rounded-lg p-2">
                <MapPin className="w-4 h-4 text-secondary-400 shrink-0" />
                <input
                  className="w-full text-xs outline-none bg-transparent placeholder:text-secondary-400 text-secondary-700"
                  placeholder="Dirección de envío (opcional)"
                  value={pedidoActual?.direccionEnvioSnapshot || ''}
                  onChange={(e) => actualizarPedido({ direccionEnvioSnapshot: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1 border border-secondary-200 bg-white rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-secondary-400 shrink-0" />
                  <span className="text-xs font-medium text-secondary-500">Forma de Pago</span>
                </div>
                <Select
                  value={pedidoActual?.formaPago || 'Contado'}
                  onChange={(val) => actualizarPedido({ formaPago: val })}
                  options={[
                    { value: 'Contado', label: 'Contado' },
                    { value: 'Transferencia', label: 'Transferencia' },
                    { value: 'Cobrado', label: 'Cobrado' },
                    { value: 'Giro 30 días', label: 'Giro 30 días' },
                    { value: 'Giro 60 días', label: 'Giro 60 días' },
                  ]}
                  className="w-full text-xs"
                />
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm pt-2 border-t border-secondary-200">
              <div className="flex justify-between text-secondary-600">
                <span>Subtotal</span>
                <span>{formatearPrecio(pedidoActual?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-secondary-600">
                <span>Descuento</span>
                <div className="flex items-center gap-1 w-16">
                  <input
                    type="number"
                    value={pedidoActual?.descuento || 0}
                    onChange={e => setDescuento(Number(e.target.value))}
                    className="w-full text-right bg-white border border-secondary-200 rounded px-1 py-0.5 text-xs"
                  />
                  <span>%</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-secondary-600">
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setIva(7)} className={`px-1.5 py-0.5 rounded ${pedidoActual?.iva === 7 ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-100'}`}>IGIC</button>
                  <button onClick={() => setIva(21)} className={`px-1.5 py-0.5 rounded ${pedidoActual?.iva === 21 ? 'bg-primary-100 text-primary-700 font-bold' : 'bg-gray-100'}`}>IVA</button>
                </div>
                <span>{formatearPrecio(((pedidoActual?.subtotal || 0) * (1 - (pedidoActual?.descuento || 0) / 100)) * ((pedidoActual?.iva || 0) / 100))}</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-primary-900 pt-2 border-t border-secondary-200">
                <span>Total</span>
                <span>{formatearPrecio(pedidoActual?.total || 0)}</span>
              </div>
            </div>

            <button
              onClick={handleGuardar}
              disabled={!pedidoActual?.lineas.length || cargandoPedido}
              className="btn-primary w-full justify-center py-3 text-lg shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 transition-all"
            >
              {cargandoPedido ? 'Guardando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
