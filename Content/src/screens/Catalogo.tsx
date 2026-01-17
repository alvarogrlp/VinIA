/**
 * VinIA - Pantalla de Catálogo de Vinos
 * 
 * Muestra el listado completo de vinos disponibles con opciones de búsqueda
 * y filtrado avanzado. Permite ver detalles de cada vino.
 */

import { useState, useEffect } from 'react';
import { Search, Filter, Wine, X, Pencil } from 'lucide-react';
import { useVinosStore, useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { VinoCard } from '../components/VinoCard';
import { VinoDetalleModal } from '../components/VinoDetalleModal';
import { Select } from '../components';
import type { Vino } from '../types';

export const Catalogo = () => {
    const { vinos, cargando, cargarVinos, buscarVinos, error } = useVinosStore();
    const { usuario } = useAuthStore();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [vinoSeleccionado, setVinoSeleccionado] = useState<Vino | null>(null);

    // Filtros locales (podrían moverse al store si se requiere persistencia o lógica compleja)
    const [filtroTipo, setFiltroTipo] = useState<string>('');
    const [filtroDO, setFiltroDO] = useState<string>('');

    useEffect(() => {
        cargarVinos();
    }, [cargarVinos]);

    // Manejar búsqueda con debounce básico
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (busqueda) {
                buscarVinos(busqueda);
            } else {
                cargarVinos(); // Recargar todos si se limpia la búsqueda
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [busqueda, buscarVinos, cargarVinos]);

    // Filtrado en memoria (para simplicidad por ahora, idealmente en backend si son muchos)
    // Nota: El store ya tiene `filtrarVinos`, pero aquí lo haremos combinando local y store si es necesario.
    // Por ahora, usamos el array `vinos` del store y filtramos visualmente.
    const vinosFiltrados = vinos.filter(vino => {
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

                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                        <Search className="absolute w-5 h-5 text-secondary-400 left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, bodega..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full input min-w-[300px]"
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>
                </div>
            </div>

            {/* Filtros */}
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

            {/* Grid de Vinos */}
            {cargando ? (
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
