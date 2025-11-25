/**
 * VinIA - Pantalla de Gestión de Usuarios
 * 
 * Solo visible para administradores.
 * Permite crear, editar y gestionar usuarios del sistema.
 */

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, AlertTriangle, UserPlus } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store';
import { AsignacionClientesModal } from '../components/AsignacionClientesModal';

interface UsuarioSistema {
  id: string;
  username: string;
  nombre: string;
  apellidos: string | null;
  rol: 'Administración' | 'Comercial' | 'Almacén';
  activo: boolean;
  ultimo_acceso: string | null;
  created_at: string;
}

export const Usuarios = () => {
  const usuario = useAuthStore((state) => state.usuario);
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<UsuarioSistema | null>(null);
  const [usuarioParaAsignar, setUsuarioParaAsignar] = useState<UsuarioSistema | null>(null);

  // Formulario
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formApellidos, setFormApellidos] = useState('');
  const [formRol, setFormRol] = useState<'Administración' | 'Comercial' | 'Almacén'>('Comercial');

  useEffect(() => {
    if (usuario?.rol === 'Administración') {
      cargarUsuarios();
    }
  }, [usuario?.rol]);

  // Verificar que el usuario es administración
  if (usuario?.rol !== 'Administración') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
          <h2 className="text-2xl font-bold text-secondary-900">Acceso Denegado</h2>
          <p className="mt-2 text-secondary-600">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await authService.getAllUsers();
      setUsuarios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setCargando(false);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await authService.createUser(
        formUsername,
        formPassword,
        formNombre,
        formApellidos,
        formRol
      );
      
      // Limpiar formulario y recargar
      setFormUsername('');
      setFormPassword('');
      setFormNombre('');
      setFormApellidos('');
      setFormRol('Comercial');
      setMostrarModal(false);
      await cargarUsuarios();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    }
  };

  const abrirConfirmacionEliminar = (user: UsuarioSistema) => {
    setUsuarioAEliminar(user);
    setMostrarConfirmacion(true);
  };

  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;

    try {
      // Desactivar el usuario permanentemente
      await authService.toggleUserStatus(usuarioAEliminar.id, false);
      setMostrarConfirmacion(false);
      setUsuarioAEliminar(null);
      await cargarUsuarios();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar usuario');
    }
  };

  const cancelarEliminar = () => {
    setMostrarConfirmacion(false);
    setUsuarioAEliminar(null);
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'Administración':
        return 'bg-red-100 text-red-800';
      case 'Comercial':
        return 'bg-blue-100 text-blue-800';
      case 'Almacén':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Gestión de Usuarios
          </h1>
          <p className="mt-1 text-secondary-600">
            Administra los usuarios del sistema
          </p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-red-800 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabla de usuarios */}
      {cargando ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow-elegant rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-secondary-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-secondary-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {usuarios.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-secondary-900">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        {user.nombre} {user.apellidos}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolColor(user.rol)}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-secondary-500">
                      {formatearFecha(user.ultimo_acceso)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.activo ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {user.rol === 'Comercial' && user.activo && (
                          <button
                            onClick={() => setUsuarioParaAsignar(user)}
                            className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                            title="Asignar clientes"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => abrirConfirmacionEliminar(user)}
                          className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de crear usuario */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/20 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl animate-fade-in">
            <h2 className="mb-4 text-2xl font-bold text-secondary-900">
              Crear Nuevo Usuario
            </h2>

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-secondary-700">
                  Usuario (ID)
                </label>
                <input
                  id="username"
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="juan.perez"
                  required
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-secondary-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="nombre" className="block mb-2 text-sm font-medium text-secondary-700">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Juan"
                  required
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="apellidos" className="block mb-2 text-sm font-medium text-secondary-700">
                  Apellidos
                </label>
                <input
                  id="apellidos"
                  type="text"
                  value={formApellidos}
                  onChange={(e) => setFormApellidos(e.target.value)}
                  placeholder="Pérez García"
                  required
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="rol" className="block mb-2 text-sm font-medium text-secondary-700">
                  Rol
                </label>
                <select
                  id="rol"
                  value={formRol}
                  onChange={(e) => setFormRol(e.target.value as any)}
                  className="input"
                >
                  <option value="Comercial">Comercial</option>
                  <option value="Administración">Administración</option>
                  <option value="Almacén">Almacén</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {mostrarConfirmacion && usuarioAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/20 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl animate-fade-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-secondary-900">
                  Confirmar Eliminación
                </h2>
                <p className="text-sm text-secondary-600">
                  Esta acción desactivará al usuario
                </p>
              </div>
            </div>

            <div className="p-4 mb-6 rounded-lg bg-secondary-50">
              <p className="text-sm text-secondary-700">
                ¿Estás seguro de que deseas eliminar al usuario{' '}
                <span className="font-semibold text-secondary-900">
                  {usuarioAEliminar.username}
                </span>
                {' '}({usuarioAEliminar.nombre} {usuarioAEliminar.apellidos})?
              </p>
              <p className="mt-2 text-xs text-secondary-600">
                El usuario será desactivado y no podrá iniciar sesión.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelarEliminar}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="flex-1 px-4 py-2 font-semibold text-white transition-all bg-red-600 rounded-lg hover:bg-red-700 active:scale-95"
              >
                Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de asignación de clientes */}
      {usuarioParaAsignar && (
        <AsignacionClientesModal
          comercial={usuarioParaAsignar}
          onClose={() => setUsuarioParaAsignar(null)}
        />
      )}
    </div>
  );
};
