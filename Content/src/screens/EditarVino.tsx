import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Wine, Image as ImageIcon } from 'lucide-react';
import { api } from '../lib/api';
import { Select, ImageUpload } from '../components';
import type { TipoVino } from '../types';

export const EditarVino = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        bodega: '',
        tipo: 'Tinto' as TipoVino,
        ano: new Date().getFullYear(),
        precio_unitario: 0,
        denominacion_origen: '',
        grado_alcohol: 13.5,
        descripcion: '',
        stock: 0,
        stock_minimo: 6,
        imagen_url: '',
        codigo_interno: '',
        nota_cata: ''
    });

    useEffect(() => {
        const cargarVino = async () => {
            if (!id) return;
            try {
                setCargando(true);
                const vino = await api.get(`/vinos/${id}`);
                setFormData({
                    nombre: vino.nombre,
                    bodega: vino.bodega,
                    tipo: vino.tipo,
                    ano: vino.ano,
                    precio_unitario: vino.precio_unitario,
                    denominacion_origen: vino.denominacion_origen,
                    grado_alcohol: vino.grado_alcohol,
                    descripcion: vino.descripcion || '',
                    stock: vino.stock,
                    stock_minimo: vino.stock_minimo,
                    imagen_url: vino.imagen_url || '',
                    codigo_interno: vino.codigo_interno || '',
                    nota_cata: vino.nota_cata || ''
                });
            } catch (err: any) {
                setError(err.message || 'Error al cargar el vino');
            } finally {
                setCargando(false);
            }
        };
        cargarVino();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'precio_unitario' || name === 'grado_alcohol' || name === 'stock' || name === 'stock_minimo' || name === 'ano')
                ? Number(value)
                : value
        }));
    };

    const handleSelectChange = (name: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        try {
            setCargando(true);
            await api.put(`/vinos/${id}`, formData);
            navigate(-1);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al actualizar el vino');
        } finally {
            setCargando(false);
        }
    };

    if (cargando && !formData.nombre) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 rounded-full border-primary-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="btn-outline">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Editar Vino</h1>
                    <p className="text-secondary-600">Modificar ficha técnica del producto</p>
                </div>
            </div>

            {error && (
                <div className="p-4 text-red-800 bg-red-100 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos Principales */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-secondary-900">
                        <Wine className="w-5 h-5 text-primary-600" />
                        <h2>Información del Producto</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="nombre" className="text-sm font-medium text-secondary-700">
                                Nombre del Vino *
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full input"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="bodega" className="text-sm font-medium text-secondary-700">
                                Bodega *
                            </label>
                            <input
                                type="text"
                                id="bodega"
                                name="bodega"
                                value={formData.bodega}
                                onChange={handleChange}
                                className="w-full input"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Select
                                label="Tipo *"
                                value={formData.tipo}
                                onChange={(val) => handleSelectChange('tipo', val)}
                                options={[
                                    { value: 'Tinto', label: 'Tinto' },
                                    { value: 'Blanco', label: 'Blanco' },
                                    { value: 'Rosado', label: 'Rosado' },
                                    { value: 'Espumoso', label: 'Espumoso' },
                                    { value: 'Fortificado', label: 'Fortificado' },
                                    { value: 'Dulce', label: 'Dulce' }
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="ano" className="text-sm font-medium text-secondary-700">
                                Añada
                            </label>
                            <input
                                type="number"
                                id="ano"
                                name="ano"
                                value={formData.ano}
                                onChange={handleChange}
                                className="w-full input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="denominacion_origen" className="text-sm font-medium text-secondary-700">
                                Denominación de Origen
                            </label>
                            <input
                                type="text"
                                id="denominacion_origen"
                                name="denominacion_origen"
                                value={formData.denominacion_origen}
                                onChange={handleChange}
                                className="w-full input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="codigo_interno" className="text-sm font-medium text-secondary-700">
                                Código Interno / SKU
                            </label>
                            <input
                                type="text"
                                id="codigo_interno"
                                name="codigo_interno"
                                value={formData.codigo_interno}
                                onChange={handleChange}
                                className="w-full input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="grado_alcohol" className="text-sm font-medium text-secondary-700">
                                Grado Alcohol (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                id="grado_alcohol"
                                name="grado_alcohol"
                                value={formData.grado_alcohol}
                                onChange={handleChange}
                                className="w-full input"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="precio_unitario" className="text-sm font-medium text-secondary-700">
                                Precio Unitario (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                id="precio_unitario"
                                name="precio_unitario"
                                value={formData.precio_unitario}
                                onChange={handleChange}
                                className="w-full input"
                            />
                        </div>
                    </div>
                </div>

                {/* Stock e Imagen */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-secondary-900">
                        <ImageIcon className="w-5 h-5 text-primary-600" />
                        <h2>Inventario e Imagen</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="stock" className="text-sm font-medium text-secondary-700">
                                Stock Actual
                            </label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full input"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="stock_minimo" className="text-sm font-medium text-secondary-700">
                                Stock Mínimo (Alerta)
                            </label>
                            <input
                                type="number"
                                id="stock_minimo"
                                name="stock_minimo"
                                value={formData.stock_minimo}
                                onChange={handleChange}
                                className="w-full input"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <ImageUpload
                                label="Imagen del Producto"
                                initialImage={formData.imagen_url}
                                onImageChange={(base64) => setFormData(prev => ({ ...prev, imagen_url: base64 || '' }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Descripcion */}
                <div className="card">
                    <div className="space-y-2">
                        <label htmlFor="descripcion" className="text-sm font-medium text-secondary-700">
                            Descripción
                        </label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows={3}
                            className="w-full input"
                        />
                    </div>
                    <div className="space-y-2 mt-4">
                        <label htmlFor="nota_cata" className="text-sm font-medium text-secondary-700">
                            Nota de Cata
                        </label>
                        <textarea
                            id="nota_cata"
                            name="nota_cata"
                            value={formData.nota_cata}
                            onChange={handleChange}
                            rows={2}
                            className="w-full input"
                        />
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={cargando}
                        className="btn-primary min-w-[150px] justify-center"
                    >
                        {cargando ? (
                            <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
