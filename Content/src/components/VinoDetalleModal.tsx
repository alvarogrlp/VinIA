import { X, Wine, Thermometer, Clock, Trophy, Info, Tag, Grape } from 'lucide-react';
import type { Vino } from '../types';

interface VinoDetalleModalProps {
    vino: Vino;
    onClose: () => void;
}

export const VinoDetalleModal = ({ vino, onClose }: VinoDetalleModalProps) => {
    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row"
            >

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 bg-white rounded-full hover:text-gray-600 hover:bg-gray-100 z-10 transition-colors shadow-sm"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left: Image & Quick Stats */}
                <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center border-r border-gray-100">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg mb-6 bg-white">
                        {vino.imagen_url ? (
                            <img
                                src={vino.imagen_url}
                                alt={vino.nombre}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-300">
                                <Wine className="w-24 h-24" />
                            </div>
                        )}

                        {/* Badges Overlay */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <span className="px-3 py-1 text-xs font-bold text-white bg-black/70 backdrop-blur rounded-full uppercase tracking-wider">
                                {vino.tipo}
                            </span>
                            {vino.denominacion_origen && (
                                <span className="px-3 py-1 text-xs font-bold text-white bg-primary-600/90 backdrop-blur rounded-full">
                                    {vino.denominacion_origen}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                            <span className="text-sm text-gray-500 font-medium">Precio Botella</span>
                            <span className="text-xl font-bold text-primary-700">{vino.precio_unitario.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                            <span className="text-sm text-gray-500 font-medium">Stock</span>
                            <span className={`text-lg font-bold ${vino.stock < (vino.stock_minimo || 10) ? 'text-orange-500' : 'text-green-600'}`}>
                                {vino.stock} uds.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Info */}
                <div className="w-full md:w-2/3 p-6 md:p-8 pb-16 bg-white">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{vino.nombre}</h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 mb-4">
                            <span className="font-semibold text-primary-600 text-lg">{vino.bodega}</span>
                            {vino.ano && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <span>{vino.ano}</span>
                                </>
                            )}
                            {vino.grado_alcohol && (
                                <>
                                    <span className="text-gray-300">•</span>
                                    <span>{vino.grado_alcohol}% Vol.</span>
                                </>
                            )}
                        </div>

                        {/* Variedad de Uva - Highlighted */}
                        {vino.variedad_uva && (
                            <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 mb-6">
                                <Grape className="w-5 h-5 mr-2" />
                                <span className="font-medium">{vino.variedad_uva}</span>
                            </div>
                        )}

                        <p className="text-gray-600 leading-relaxed text-lg">
                            {vino.descripcion}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                                <Thermometer className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-1">Temperatura</h4>
                                <p className="text-gray-600">{vino.temperatura_servicio || 'Recomendada estándar'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 mt-1">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-1">Potencial de Guarda</h4>
                                <p className="text-gray-600">{vino.potencial_guarda || 'Consumo inmediato'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tasting Notes */}
                    <div className="space-y-6 mb-8 border-t border-gray-100 pt-8">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary-500" />
                            Notas de Cata
                        </h3>

                        <div className="grid gap-4">
                            {vino.nota_cata && (
                                <div className="bg-gray-50/80 p-4 rounded-xl">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Vista</span>
                                    <p className="text-gray-700">{vino.nota_cata}</p>
                                </div>
                            )}
                            {vino.aroma && (
                                <div className="bg-gray-50/80 p-4 rounded-xl">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Nariz</span>
                                    <p className="text-gray-700">{vino.aroma}</p>
                                </div>
                            )}
                            {vino.sabor && (
                                <div className="bg-gray-50/80 p-4 rounded-xl">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Boca</span>
                                    <p className="text-gray-700">{vino.sabor}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Awards or Pairing */}
                    {(vino.premios || (vino.maridaje && vino.maridaje.length > 0)) && (
                        <div className="flex flex-col gap-6 border-t border-gray-100 pt-6">
                            {vino.premios && (
                                <div className="flex items-start gap-3">
                                    <Trophy className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Premios y Reconocimientos</h4>
                                        <p className="text-gray-600 text-sm">{vino.premios}</p>
                                    </div>
                                </div>
                            )}

                            {vino.maridaje && vino.maridaje.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <Tag className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Maridaje Ideal</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {vino.maridaje.map((m, i) => (
                                                <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-100">
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="h-10"></div>
                </div>
            </div>
        </div>
    );
};
