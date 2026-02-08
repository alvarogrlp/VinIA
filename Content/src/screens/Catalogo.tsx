/**
 * VinIA - Pantalla de Catálogo de Vinos
 * 
 * Muestra el listado completo de vinos disponibles con opciones de búsqueda
 * y filtrado avanzado. Permite ver detalles de cada vino.
 */

import { useState, useEffect } from 'react';
import { Search, Filter, Wine, X, Pencil, Sparkles, Loader2 } from 'lucide-react';
import { useVinosStore, useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { VinoCard } from '../components/VinoCard';
import { VinoDetalleModal } from '../components/VinoDetalleModal';
import { Select } from '../components';
import { aiService, type AISearchResult } from '../services/ai.service';
import type { Vino } from '../types';

export const Catalogo = () => {
    const { vinos, cargando, cargarVinos, buscarVinos, error } = useVinosStore();
    const { usuario } = useAuthStore();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [busquedaIA, setBusquedaIA] = useState('');
    const [vinoSeleccionado, setVinoSeleccionado] = useState<Vino | null>(null);

    // AI Search State
    const [isAISearching, setIsAISearching] = useState(false);
    const [aiResults, setAiResults] = useState<AISearchResult[]>([]);
    const [isAIMode, setIsAIMode] = useState(false);

    // Filtros locales
    const [filtroTipo, setFiltroTipo] = useState<string>('');
    const [filtroDO, setFiltroDO] = useState<string>('');

    useEffect(() => {
        cargarVinos();
    }, [cargarVinos]);

    // Manejar búsqueda normal (si no es AI Mode)
    useEffect(() => {
        if (!isAIMode) {
            const timeoutId = setTimeout(() => {
                if (busqueda && busqueda.length > 2) {
                    buscarVinos(busqueda);
                } else if (!busqueda) {
                    cargarVinos();
                }
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [busqueda, buscarVinos, cargarVinos, isAIMode]);

    const handleAISearch = async () => {
        if (!busquedaIA) return;
        setIsAISearching(true);
        setIsAIMode(true);
        try {
            const results = await aiService.semanticSearch(busquedaIA);
            setAiResults(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAISearching(false);
        }
    };

    const clearSearch = () => {
        setBusqueda('');
        setBusquedaIA('');
        setIsAIMode(false);
        setAiResults([]);
        cargarVinos();
    };

    // Estrategia de filtrado:
    // Si isAIMode, usamos los IDs que devolvió la IA.
    // Si no, usamos el store `vinos` y filtros locales.
    const vinosAVisualizar = isAIMode
        ? aiResults.map(r => vinos.find(v => v.id === r.vinoId)).filter(Boolean) as Vino[]
        : vinos;

    // En modo IA, no aplicar filtros locales para mostrar todos los resultados de la IA
    const vinosFiltrados = isAIMode
        ? vinosAVisualizar
        : vinosAVisualizar.filter(vino => {
            if (filtroTipo && vino.tipo !== filtroTipo) return false;
            if (filtroDO && vino.denominacion_origen !== filtroDO) return false;
            return true;
        });

    // Obtener listas únicas para los filtros
    const tiposVino = Array.from(new Set(vinos.map(v => v.tipo))).filter(Boolean);
    const dosVino = Array.from(new Set(vinos.map(v => v.denominacion_origen))).filter(Boolean);

    const handleVinoClick = (vino: Vino) => {
        setVinoSeleccionado(vino);
    };

    const handleEditClick = (e: React.MouseEvent, vinoId: string) => {
        e.stopPropagation();
        navigate(`/inventario/editar/${vinoId}`);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header y Búsqueda */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Catálogo de Vinos</h1>
                    <p className="text-secondary-600">Explora nuestra selección de vinos exclusivos</p>
                </div>
            </div>

            {/* Búsqueda Normal */}
            {!isAIMode && (
                <div className="relative">
                    <Search className="absolute w-5 h-5 left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, bodega, tipo..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full input pl-10 pr-10"
                    />
                    {busqueda && (
                        <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary-100 rounded-full text-secondary-500">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Búsqueda IA */}
            <div className={`relative ${isAIMode ? 'ring-2 ring-primary-500 rounded-lg' : ''}`}>
                <div className="relative">
                    <Sparkles className={`absolute w-5 h-5 left-3 top-1/2 -translate-y-1/2 transition-colors ${isAIMode ? 'text-primary-600' : 'text-secondary-400'}`} />
                    <input
                        type="text"
                        placeholder="Búsqueda inteligente: describe lo que buscas (ej: algo fresco para pescado)"
                        value={busquedaIA}
                        onChange={(e) => setBusquedaIA(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAISearch();
                        }}
                        className={`w-full input pl-10 pr-32 ${isAIMode ? 'border-primary-500 bg-primary-50/30' : ''}`}
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {isAIMode && (
                            <button onClick={clearSearch} className="p-1 hover:bg-secondary-100 rounded-full text-secondary-500">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={handleAISearch}
                            disabled={isAISearching || !busquedaIA}
                            className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${isAIMode
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700'
                                }`}
                            title="Búsqueda Inteligente (IA)"
                        >
                            {isAISearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {isAIMode ? 'Activo' : 'Buscar con IA'}
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Results Explanation */}
            {isAIMode && aiResults.length > 0 && (
                <div className="bg-gradient-to-tl from-secondary-100 to-white border border-primary-200 rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-gradient-to-br from-secondary-800 to-black rounded-lg shadow-lg">
                            <Sparkles className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary-900">Resultados de Búsqueda Inteligente</h3>
                            <p className="text-sm text-secondary-600">La IA ha seleccionado estos vinos basándose en tu consulta</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiResults.map((res, idx) => {
                            const vino = vinos.find(v => v.id === res.vinoId);
                            return (
                                <div
                                    key={res.vinoId}
                                    className="bg-white rounded-lg p-4 border border-secondary-200 hover:border-primary-400 transition-all cursor-pointer hover:shadow-md group"
                                    onClick={() => vino && handleVinoClick(vino)}
                                >
                                    <div className="flex items-start gap-2 mb-3">
                                        <div className="flex-shrink-0 w-7 h-7 bg-secondary-900 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:bg-primary-600 transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-secondary-900 mb-1 truncate">{res.nombre}</h4>
                                            <p className="text-xs text-secondary-600 leading-relaxed font-medium">{res.razon}</p>
                                        </div>
                                    </div>
                                    {vino && (
                                        <div className="pt-3 border-t border-secondary-100 flex items-center justify-between">
                                            <span className="text-sm text-secondary-500">{vino.bodega}</span>
                                            <span className="font-bold text-primary-700">
                                                {vino.precio_unitario.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filtros - Solo visible en modo normal */}
            {!isAIMode && (
                <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-secondary-200">
                    <div className="flex items-center gap-2 text-secondary-600">
                        <Filter className="w-5 h-5" />
                        <span className="text-sm font-medium">Filtros:</span>
                    </div>

                    <div className="min-w-[200px]">
                        <Select
                            value={filtroTipo}
                            onChange={(val) => setFiltroTipo(val)}
                            options={[
                                { value: '', label: 'Todos los Tipos' },
                                ...tiposVino.map(t => ({ value: t, label: t }))
                            ]}
                            placeholder="Tipo de Vino"
                        />
                    </div>

                    <div className="min-w-[200px]">
                        <Select
                            value={filtroDO}
                            onChange={(val) => setFiltroDO(val)}
                            options={[
                                { value: '', label: 'Todas las D.O.' },
                                ...dosVino.map(d => ({ value: String(d), label: String(d) }))
                            ]}
                            placeholder="Denominación de Origen"
                        />
                    </div>

                    {(filtroTipo || filtroDO) && (
                        <button
                            onClick={() => {
                                setFiltroTipo('');
                                setFiltroDO('');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                        >
                            <X className="w-4 h-4" />
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}

            {/* Grid de Vinos */}
            {cargando || isAISearching ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-[400px] bg-secondary-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-8 text-center bg-red-50 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            ) : vinosFiltrados.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-lg border border-dashed border-secondary-300">
                    <Wine className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
                    <p className="text-lg font-medium text-secondary-900">No se encontraron vinos</p>
                    <p className="text-secondary-500">Intenta con otros términos o filtros</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {vinosFiltrados.map((vino) => (
                        <div key={vino.id} className="relative group">
                            <VinoCard
                                vino={vino}
                                onClick={() => handleVinoClick(vino)}
                            />
                            {usuario?.rol === 'Administración' && (
                                <button
                                    onClick={(e) => handleEditClick(e, vino.id)}
                                    className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm text-primary-600 rounded-full shadow-md hover:bg-primary-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                                    title="Editar Vino"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Detalle */}
            {vinoSeleccionado && (
                <VinoDetalleModal
                    vino={vinoSeleccionado}
                    onClose={() => setVinoSeleccionado(null)}
                />
            )}
        </div>
    );
};
