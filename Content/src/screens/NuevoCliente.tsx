/**
 * VinIA - Pantalla de Nuevo Cliente
 * 
 * Formulario completo para el alta de nuevos clientes.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Percent
} from 'lucide-react';
import { useClientesStore } from '../store';
import type { TipoCliente } from '../types';

export const NuevoCliente = () => {
  const navigate = useNavigate();
  const { agregarCliente, cargando } = useClientesStore();
  const [error, setError] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    cif: '',
    tipo: 'Restaurante' as TipoCliente,
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    provincia: '',
    telefono: '',
    email: '',
    personaContacto: '',
    descuento: 0,
    zona: 'Norte' as 'Norte' | 'Sur' | 'Santa Cruz',
    notas: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'descuento' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!formData.cif.trim()) {
      setError('El CIF es obligatorio');
      return;
    }

    try {
      await agregarCliente({ ...formData, activo: true });
      navigate('/clientes');
    } catch (err: any) {
      setError(err.message || 'Error al crear el cliente');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/clientes')} className="btn-outline">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Nuevo Cliente</h1>
          <p className="text-secondary-600">Complete la información para dar de alta un nuevo cliente</p>
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
            <Building2 className="w-5 h-5 text-primary-600" />
            <h2>Datos de la Empresa</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="nombre" className="text-sm font-medium text-secondary-700">
                Nombre Fiscal / Comercial *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full input"
                placeholder="Ej: Restaurante El Mirador"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="cif" className="text-sm font-medium text-secondary-700">
                CIF / NIF *
              </label>
              <input
                type="text"
                id="cif"
                name="cif"
                value={formData.cif}
                onChange={handleChange}
                className="w-full input"
                placeholder="Ej: B12345678"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tipo" className="text-sm font-medium text-secondary-700">
                Tipo de Cliente
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full input"
              >
                <option value="Restaurante">Restaurante</option>
                <option value="Hotel">Hotel</option>
                <option value="Tienda">Tienda</option>
                <option value="Distribuidor">Distribuidor</option>
                <option value="Particular">Particular</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="descuento" className="text-sm font-medium text-secondary-700">
                Descuento Habitual (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Percent className="w-4 h-4 text-secondary-400" />
                </div>
                <input
                  type="number"
                  id="descuento"
                  name="descuento"
                  value={formData.descuento}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full pl-10 input"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-secondary-900">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h2>Dirección y Ubicación</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="direccion" className="text-sm font-medium text-secondary-700">
                Dirección Completa
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full input"
                placeholder="Ej: C/ Mayor, 123"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="ciudad" className="text-sm font-medium text-secondary-700">
                Ciudad
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className="w-full input"
                placeholder="Ej: Madrid"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="codigoPostal" className="text-sm font-medium text-secondary-700">
                Código Postal
              </label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleChange}
                className="w-full input"
                placeholder="Ej: 28001"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="provincia" className="text-sm font-medium text-secondary-700">
                Provincia
              </label>
              <input
                type="text"
                id="provincia"
                name="provincia"
                value={formData.provincia}
                onChange={handleChange}
                className="w-full input"
                placeholder="Ej: Madrid"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="zona" className="text-sm font-medium text-secondary-700">
                Zona de Reparto *
              </label>
              <select
                id="zona"
                name="zona"
                value={(formData as any).zona || 'Norte'}
                onChange={handleChange}
                className="w-full input"
                required
              >
                <option value="Norte">Norte</option>
                <option value="Sur">Sur</option>
                <option value="Santa Cruz">Santa Cruz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4 text-lg font-semibold text-secondary-900">
            <User className="w-5 h-5 text-primary-600" />
            <h2>Información de Contacto</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="personaContacto" className="text-sm font-medium text-secondary-700">
                Persona de Contacto
              </label>
              <input
                type="text"
                id="personaContacto"
                name="personaContacto"
                value={formData.personaContacto}
                onChange={handleChange}
                className="w-full input"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="telefono" className="text-sm font-medium text-secondary-700">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="w-4 h-4 text-secondary-400" />
                </div>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full pl-10 input"
                  placeholder="Ej: 600 123 456"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-secondary-700">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-secondary-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 input"
                  placeholder="Ej: contacto@restaurante.com"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="notas" className="text-sm font-medium text-secondary-700">
                Notas Adicionales
              </label>
              <textarea
                id="notas"
                name="notas"
                value={formData.notas}
                onChange={handleChange}
                rows={3}
                className="w-full input min-h-[80px]"
                placeholder="Información adicional relevante..."
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
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
                Guardar Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
