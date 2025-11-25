/**
 * VinIA - Pantalla Catálogo de Vinos
 * 
 * Muestra el catálogo completo de vinos con capacidad de búsqueda,
 * filtrado y vista detallada.
 */

import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useVinosStore, useAuthStore } from '../store';
import { VinoCard } from '../components/VinoCard';

export const Catalogo = () => {
  const { vinos, cargando, cargarVinos, buscarVinos } = useVinosStore();
  const { usuario } = useAuthStore();
  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('Todos');
  const [ordenamiento, setOrdenamiento] = useState<string>('relevancia');
  const [vinosFiltrados, setVinosFiltrados] = useState(vinos);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    cargarVinos();
  }, [cargarVinos]);

  useEffect(() => {
    const filtrarYOrdenar = async () => {
      let resultados = vinos;

      // Filtrar por búsqueda (si hay búsqueda, ya se habrá llamado a buscarVinos)
      // Los resultados ya están en el store en vinos
      
      // Filtrar por tipo
      if (tipoFiltro !== 'Todos') {
        resultados = resultados.filter((vino) => vino.tipo === tipoFiltro);
      }

      // Ordenar
      switch (ordenamiento) {
        case 'precio-asc':
          resultados = [...resultados].sort((a, b) => a.precio_unitario - b.precio_unitario);
          break;
        case 'precio-desc':
          resultados = [...resultados].sort((a, b) => b.precio_unitario - a.precio_unitario);
          break;
        case 'nombre':
          resultados = [...resultados].sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        case 'ano':
          resultados = [...resultados].sort((a, b) => (b.ano || 0) - (a.ano || 0));
          break;
        default:
          break;
      }

      setVinosFiltrados(resultados);
    };
    
    filtrarYOrdenar();
  }, [tipoFiltro, ordenamiento, vinos]);
  
  // Efecto separado para búsqueda
  useEffect(() => {
    const realizarBusqueda = async () => {
      if (busqueda.trim()) {
        await buscarVinos(busqueda);
      } else {
        await cargarVinos();
      }
    };
    
    const timeoutId = setTimeout(realizarBusqueda, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [busqueda]);

  const handleVinoClick = (vinoId: string) => {
    console.log('Ver detalle del vino:', vinoId);
    alert(`Ver detalle del vino ID: ${vinoId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Catálogo de Vinos
          </h1>
          <p className="mt-2 text-secondary-600">
            Explora nuestro catálogo completo de vinos y bodegas
          </p>
        </div>
        {usuario?.rol === 'Administración' && (
          <button 
            onClick={() => alert('Función de añadir vino: Aquí se abrirá un formulario para añadir un nuevo vino al catálogo con todos sus detalles (nombre, bodega, tipo, año, precio, DO, etc.)')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir vino
          </button>
        )}
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
              <Search className="w-5 h-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, bodega, región, variedad, tipo, maridaje..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input w-full"
              style={{ paddingLeft: '2.5rem' }}
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Botón filtros */}
          <button 
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="btn-outline flex items-center justify-center"
          >
            <Filter className="w-5 h-5 mr-2" />
            {mostrarFiltros ? 'Ocultar filtros' : 'Más filtros'}
          </button>
        </div>

        {/* Filtros avanzados (desplegable) */}
        {mostrarFiltros && (
          <div className="pt-4 mt-4 space-y-4 border-t border-secondary-200">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="precioMin" className="block mb-2 text-sm font-medium text-secondary-700">Precio mínimo</label>
                <input id="precioMin" type="number" placeholder="0 €" className="input" />
              </div>
              <div>
                <label htmlFor="precioMax" className="block mb-2 text-sm font-medium text-secondary-700">Precio máximo</label>
                <input id="precioMax" type="number" placeholder="1000 €" className="input" />
              </div>
              <div>
                <label htmlFor="denominacion" className="block mb-2 text-sm font-medium text-secondary-700">Denominación de Origen</label>
                <select id="denominacion" className="input">
                  <option>Todas</option>
                  <option>Rioja</option>
                  <option>Ribera del Duero</option>
                  <option>Priorat</option>
                  <option>Rías Baixas</option>
                  <option>Rueda</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => alert('Filtros aplicados')} className="btn-primary">Aplicar filtros</button>
              <button onClick={() => { setMostrarFiltros(false); setTipoFiltro('Todos'); }} className="btn-outline">Limpiar</button>
            </div>
          </div>
        )}

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['Todos', 'Tinto', 'Blanco', 'Rosado', 'Espumoso', 'Fortificado', 'Dulce'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipoFiltro(tipo)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                tipo === tipoFiltro
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-secondary-600">
            Mostrando <span className="font-medium text-secondary-900">{vinosFiltrados.length}</span> vinos
          </p>
          <select 
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value)}
            className="px-4 py-2 text-sm border rounded-lg border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="relevancia">Ordenar por: Relevancia</option>
            <option value="precio-asc">Precio: Menor a mayor</option>
            <option value="precio-desc">Precio: Mayor a menor</option>
            <option value="nombre">Nombre: A-Z</option>
            <option value="ano">Año: Más reciente</option>
          </select>
        </div>

        {/* Grid de vinos */}
        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 rounded-full border-primary-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            {vinosFiltrados.length === 0 ? (
              <div className="py-20 text-center card">
                <Search className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
                <p className="text-lg font-medium text-secondary-900 mb-2">
                  No se encontraron vinos
                </p>
                <p className="text-secondary-600">
                  {(() => {
                    if (busqueda) {
                      return `No hay resultados para "${busqueda}". Intenta con otro término.`;
                    }
                    if (tipoFiltro === 'Todos') {
                      return 'No hay vinos disponibles en el catálogo.';
                    }
                    return `No hay vinos del tipo ${tipoFiltro} disponibles.`;
                  })()}
                </p>
                {(busqueda || tipoFiltro !== 'Todos') && (
                  <button
                    onClick={() => {
                      setBusqueda('');
                      setTipoFiltro('Todos');
                    }}
                    className="mt-4 btn-outline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vinosFiltrados.map((vino) => (
              <VinoCard
                key={vino.id}
                vino={vino}
                onClick={() => handleVinoClick(vino.id)}
              />
            ))}
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
