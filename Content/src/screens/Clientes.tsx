/**
 * VinIA - Pantalla de Clientes
 * 
 * Gestión de clientes con listado, búsqueda y acciones.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Mail, Phone, MapPin, UserCheck } from 'lucide-react';
import { useClientesStore, useAuthStore } from '../store';




export const Clientes = () => {
  const navigate = useNavigate();
  const { clientes, cargando, cargarClientes } = useClientesStore();
  const { usuario } = useAuthStore();
  const [busqueda, setBusqueda] = useState('');


  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.cif.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.ciudad.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Clientes</h1>
          <p className="mt-2 text-secondary-600">
            Gestiona tu cartera de clientes
          </p>
        </div>
        {usuario?.rol === 'Administración' && (
          <button
            onClick={() => navigate('/clientes/nuevo')}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo cliente
          </button>
        )}
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-secondary-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, CIF o ciudad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input w-full"
            style={{ paddingLeft: '3rem' }}
          />
        </div>
      </div>

      {/* Lista de clientes */}
      {cargando ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 rounded-full border-primary-500 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <>
          {clientesFiltrados.length === 0 ? (
            <div className="py-20 text-center card">
              <p className="text-lg text-secondary-600">
                No se encontraron clientes
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => navigate(`/clientes/${cliente.id}`)}
                  className="card cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {cliente.nombre}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {cliente.tipo} • {cliente.cif}
                      </p>
                    </div>
                    <span
                      className={`badge ${cliente.activo ? 'badge-success' : 'badge-error'
                        }`}
                    >
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm text-secondary-700">
                      <MapPin className="w-4 h-4 mt-0.5 text-secondary-500" />
                      <span>
                        {cliente.direccion}, {cliente.ciudad} ({cliente.provincia})
                      </span>
                    </div>

                    {/* Mostrar comercial asignado si existe (solo Admin) */}
                    {cliente.comercial_nombre && (
                      <div className="flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 px-2 py-1 rounded-md w-fit">
                        <UserCheck className="w-4 h-4" />
                        <span>Gestor: {cliente.comercial_nombre}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-secondary-700">
                      <Phone className="w-4 h-4 text-secondary-500" />
                      <span>{cliente.telefono}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-secondary-700">
                      <Mail className="w-4 h-4 text-secondary-500" />
                      <span>{cliente.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};
