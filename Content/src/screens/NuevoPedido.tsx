/**
 * VinIA - Pantalla de Nuevo Pedido
 * 
 * Flujo de creación de pedidos para comerciales.
 * Selección de cliente, adición de productos y confirmación.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  Save,
  User,
  ShoppingCart,
  ArrowLeft
} from 'lucide-react';
import { usePedidosStore, useClientesStore, useVinosStore } from '../store';
import { formatearPrecio } from '../utils/helpers';

export const NuevoPedido = () => {
  const navigate = useNavigate();
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
  const { vinos, cargarVinos } = useVinosStore();

  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaVino, setBusquedaVino] = useState('');
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string | null>(null);
  const [mostrarBuscadorVinos, setMostrarBuscadorVinos] = useState(false);

  useEffect(() => {
    cargarClientes();
    cargarVinos();

    // Limpiar pedido anterior al entrar
    cancelarPedido();
  }, [cargarClientes, cargarVinos, cancelarPedido]);

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    c.cif.toLowerCase().includes(busquedaCliente.toLowerCase())
  ).slice(0, 5);

  // Filtrar vinos
  const vinosFiltrados = vinos.filter(v => {
    const term = busquedaVino.toLowerCase();
    return (
      v.nombre.toLowerCase().includes(term) ||
      v.bodega.toLowerCase().includes(term) ||
      v.tipo.toLowerCase().includes(term) ||
      (v.ano && v.ano.toString().includes(term)) ||
      (v.denominacion_origen && v.denominacion_origen.toLowerCase().includes(term)) ||
      (v.variedad_uva && v.variedad_uva.toLowerCase().includes(term))
    );
  }).slice(0, 10);

  const handleSeleccionarCliente = (id: string) => {
    setClienteSeleccionadoId(id);
    crearPedido(id);
    setBusquedaCliente('');
  };

  const handleAgregarVino = (vino: any) => {
    if (!pedidoActual) return;

    // Verificar stock
    if (vino.stock <= 0) {
      alert('No hay stock disponible para este producto');
      return;
    }

    // Verificar si ya existe
    const existe = pedidoActual.lineas.find(l => l.vinoId === vino.id);
    if (existe) {
      if (existe.cantidad + 1 > vino.stock) {
        alert('No hay suficiente stock disponible');
        return;
      }
      actualizarLineaPedido(existe.id, {
        cantidad: existe.cantidad + 1,
        cantidadBultos: (existe.cantidadBultos || 0) + 1
        // Nota: Esto asume suma simple, pero si mezcla cajas y botellas es complejo.
        // Simplificación: Al agregar desde buscador, siempre suma 1 unidad del tipo configurado actualmente?
        // Mejor: Al agregar desde buscador, siempre agrega 1 BOTELLA extra al total.
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
    setBusquedaVino('');
    setMostrarBuscadorVinos(false);
  };

  const handleUpdateBultos = (linea: any, nuevoTipo: 'BOTELLA' | 'CAJA', nuevosBultos: number) => {
    const vino = vinos.find(v => v.id === linea.vinoId);
    if (!vino) return;

    const botellasPorBulto = nuevoTipo === 'CAJA' ? (vino.botellas_por_caja || 6) : 1;
    const totalBotellas = nuevosBultos * botellasPorBulto;

    if (totalBotellas > vino.stock) {
      alert(`Stock insuficiente. Necesitas ${totalBotellas} botellas, hay ${vino.stock}.`);
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

    // Validar stock antes de enviar
    const lineasSinStock = pedidoActual.lineas.filter(linea => {
      const vino = vinos.find(v => v.id === linea.vinoId);
      return !vino || linea.cantidad > vino.stock;
    });

    if (lineasSinStock.length > 0) {
      const nombres = lineasSinStock.map(l => l.vinoNombre).join(', ');
      alert(`No hay stock suficiente para los siguientes vinos: ${nombres}. Por favor, ajuste las cantidades.`);
      return;
    }

    try {
      await guardarPedido();
      navigate('/pedidos');
    } catch (error) {
      console.error('Error guardando pedido:', error);
      alert('Error al guardar el pedido: ' + (error as Error).message);
    }
  };

  if (!clienteSeleccionadoId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/pedidos')} className="btn-outline">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-secondary-900">Nuevo Pedido - Seleccionar Cliente</h1>
        </div>

        <div className="card">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar cliente por nombre o CIF..."
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              className="w-full input"
              style={{ paddingLeft: '3rem' }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            {clientesFiltrados.map(cliente => (
              <button
                key={cliente.id}
                onClick={() => handleSeleccionarCliente(cliente.id)}
                className="flex items-center justify-between w-full p-4 text-left transition-colors border rounded-lg hover:bg-primary-50 border-secondary-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary-100 group-hover:bg-primary-200">
                    <User className="w-5 h-5 text-secondary-600 group-hover:text-primary-700" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{cliente.nombre}</p>
                    <p className="text-sm text-secondary-500">{cliente.cif} • {cliente.ciudad}</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 rotate-180 text-secondary-400 group-hover:text-primary-600" />
              </button>
            ))}
            {clientesFiltrados.length === 0 && busquedaCliente && (
              <p className="py-8 text-center text-secondary-500">No se encontraron clientes</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setClienteSeleccionadoId(null)} className="btn-outline">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Nuevo Pedido</h1>
            <p className="text-secondary-600">
              Cliente: <span className="font-medium text-primary-700">
                {clientes.find(c => c.id === clienteSeleccionadoId)?.nombre}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={handleGuardar}
          disabled={!pedidoActual?.lineas.length || cargandoPedido}
          className="btn-primary"
        >
          {cargandoPedido ? (
            <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          Confirmar Pedido
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Columna Izquierda: Buscador y Productos */}
        <div className="space-y-6 lg:col-span-2">
          {/* Buscador de productos */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-secondary-900">Agregar Productos</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, bodega, tipo, año..."
                value={busquedaVino}
                onChange={(e) => {
                  setBusquedaVino(e.target.value);
                  setMostrarBuscadorVinos(true);
                }}
                onFocus={() => setMostrarBuscadorVinos(true)}
                className="w-full input"
                style={{ paddingLeft: '3rem' }}
              />

              {/* Dropdown de resultados */}
              {mostrarBuscadorVinos && busquedaVino && (
                <div className="absolute z-10 w-full mt-1 bg-white border shadow-lg rounded-xl border-secondary-200 max-h-96 overflow-y-auto">
                  {vinosFiltrados.map(vino => (
                    <button
                      key={vino.id}
                      onClick={() => handleAgregarVino(vino)}
                      className="flex items-center justify-between w-full p-3 text-left transition-colors hover:bg-primary-50 border-b border-secondary-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded bg-secondary-100">
                          {vino.imagen_url && (
                            <img src={vino.imagen_url} alt={vino.nombre} className="object-cover w-full h-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{vino.nombre}</p>
                          <p className="text-xs text-secondary-500">
                            {vino.bodega} • {vino.tipo} {vino.ano} • Stock: {vino.stock}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary-700">{formatearPrecio(vino.precio_unitario)}</span>
                        <Plus className="w-5 h-5 text-secondary-400" />
                      </div>
                    </button>
                  ))}
                  {vinosFiltrados.length === 0 && (
                    <div className="p-4 text-center text-secondary-500">No se encontraron vinos</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lista de líneas */}
          <div className="card">
            <h2 className="mb-4 text-lg font-semibold text-secondary-900">
              Productos en el pedido ({pedidoActual?.lineas.length || 0})
            </h2>

            {(!pedidoActual?.lineas || pedidoActual.lineas.length === 0) ? (
              <div className="py-12 text-center border-2 border-dashed rounded-lg border-secondary-200">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                <p className="text-secondary-500">El carrito está vacío</p>
                <p className="text-sm text-secondary-400">Busca y agrega productos arriba</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidoActual.lineas.map(linea => {
                  const vino = vinos.find(v => v.id === linea.vinoId);
                  const stock = vino?.stock || 0;

                  return (
                    <div key={linea.id} className="flex flex-col gap-4 p-4 border rounded-lg border-secondary-100 bg-secondary-50/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-secondary-900">{linea.vinoNombre}</p>
                          <div className="flex items-center gap-2 text-sm text-secondary-500">
                            <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded text-xs font-semibold">
                              Añada {linea.anada}
                            </span>
                            <span>•</span>
                            <span>{formatearPrecio(linea.precioUnitario)} / botella</span>
                          </div>
                          <p className={`text-xs mt-1 ${stock - linea.cantidad < 10 ? 'text-amber-600 font-medium' : 'text-secondary-400'}`}>
                            Stock disponible: {stock} botellas
                          </p>
                        </div>
                        <div className="font-bold text-secondary-900">
                          {formatearPrecio(linea.subtotal)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        {/* Selector de Tipo de Bulto */}
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-secondary-200 p-1">
                          <button
                            onClick={() => handleUpdateBultos(linea, 'BOTELLA', linea.cantidadBultos || linea.cantidad)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${linea.tipoBulto === 'BOTELLA' ? 'bg-primary-100 text-primary-700' : 'text-secondary-500 hover:bg-secondary-50'}`}
                          >
                            Botella
                          </button>
                          <button
                            onClick={() => handleUpdateBultos(linea, 'CAJA', Math.max(1, Math.floor(linea.cantidad / (vino?.botellas_por_caja || 6))))}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${linea.tipoBulto === 'CAJA' ? 'bg-primary-100 text-primary-700' : 'text-secondary-500 hover:bg-secondary-50'}`}
                          >
                            Caja x{vino?.botellas_por_caja || 6}
                          </button>
                        </div>

                        {/* Control de Cantidad (Bultos) */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-secondary-500 font-medium uppercase min-w-[3rem]">
                            {linea.tipoBulto === 'CAJA' ? 'Cajas' : 'Botellas'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateBultos(linea, linea.tipoBulto || 'BOTELLA', Math.max(1, (linea.cantidadBultos || 0) - 1))}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-secondary-200 hover:bg-secondary-100"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{linea.cantidadBultos || linea.cantidad}</span>
                            <button
                              onClick={() => handleUpdateBultos(linea, linea.tipoBulto || 'BOTELLA', (linea.cantidadBultos || 0) + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-secondary-200 hover:bg-secondary-100"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => eliminarLineaPedido(linea.id)}
                          className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Datos de Entrega y Resumen */}
        <div className="lg:col-span-1 space-y-6">
          {/* Datos de Entrega */}
          <div className="card bg-white border-secondary-100">
            <h2 className="mb-4 text-lg font-semibold text-secondary-900">Datos de Entrega</h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-secondary-700">Dirección de Envío</label>
                <textarea
                  rows={3}
                  value={pedidoActual?.direccionEnvioSnapshot || ''}
                  onChange={(e) => actualizarPedido({ direccionEnvioSnapshot: e.target.value })}
                  placeholder="Dirección completa de entrega..."
                  className="w-full input text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-secondary-700">Instrucciones de Entrega</label>
                <textarea
                  rows={2}
                  value={pedidoActual?.instruccionesEntrega || ''}
                  onChange={(e) => actualizarPedido({ instruccionesEntrega: e.target.value })}
                  placeholder="Ej: Entregar de 9:00 a 11:30..."
                  className="w-full input text-sm"
                />
                <p className="mt-1 text-xs text-secondary-400">
                  Especifique horario o detalles de recepción.
                </p>
              </div>
            </div>
          </div>

          <div className="sticky top-6 card bg-primary-50 border-primary-100">
            <h2 className="mb-4 text-lg font-semibold text-primary-900">Resumen del Pedido</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-secondary-600">
                <span>Subtotal</span>
                <span>{formatearPrecio(pedidoActual?.subtotal || 0)}</span>
              </div>

              <div className="flex items-center justify-between text-secondary-600">
                <span>Descuento (%)</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pedidoActual?.descuento || 0}
                  onChange={(e) => setDescuento(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-right border rounded border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Selector de Impuestos */}
              <div className="py-2 border-t border-b border-primary-200/50 my-2">
                <span className="block mb-2 text-secondary-600">Impuestos</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="iva"
                      checked={pedidoActual?.iva === 21}
                      onChange={() => setIva(21)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>IVA (21%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="iva"
                      checked={pedidoActual?.iva === 7}
                      onChange={() => setIva(7)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>IGIC (7%)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between text-secondary-600">
                <span>{pedidoActual?.iva === 7 ? 'IGIC' : 'IVA'} ({pedidoActual?.iva}%)</span>
                <span>{formatearPrecio(((pedidoActual?.subtotal || 0) * (1 - (pedidoActual?.descuento || 0) / 100)) * ((pedidoActual?.iva || 0) / 100))}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-primary-200 flex justify-between items-end">
                <span className="font-bold text-primary-900">Total</span>
                <span className="text-2xl font-bold text-primary-700">
                  {formatearPrecio(pedidoActual?.total || 0)}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleGuardar}
                disabled={!pedidoActual?.lineas.length || cargandoPedido}
                className="w-full btn-primary py-3 justify-center"
              >
                Confirmar Pedido
              </button>
              <button
                onClick={() => navigate('/pedidos')}
                className="w-full btn-outline bg-white justify-center"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
